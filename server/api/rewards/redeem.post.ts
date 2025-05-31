import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 验证请求数据 - 支持自定义消耗事件
    if (!body.reward_id && !body.custom_event) {
      throw createError({
        statusCode: 400,
        statusMessage: "奖励ID或自定义事件是必需的",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    let reward: any;

    // 处理自定义消耗事件或预设奖励
    if (body.custom_event) {
      // 自定义消耗事件
      reward = {
        name: body.custom_event.name,
        stars_cost: body.custom_event.stars_cost,
        description: "自定义消耗事件",
      };
    } else {
      // 获取预设奖励信息
      const { data: rewardData, error: rewardError } = await supabase
        .from("rewards")
        .select("*")
        .eq("id", body.reward_id)
        .single();

      if (rewardError) {
        throw createError({
          statusCode: 404,
          statusMessage: "奖励不存在",
        });
      }

      reward = rewardData;
    }

    // 获取儿童状态
    const { data: childStatus, error: statusError } = await supabase
      .from("child_status")
      .select("*")
      .limit(1)
      .single();

    if (statusError) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取儿童状态失败",
        data: statusError,
      });
    }

    // 检查星星是否足够
    if (childStatus.total_stars < reward.stars_cost) {
      throw createError({
        statusCode: 400,
        statusMessage: `星星不足！需要 ${reward.stars_cost} 颗星星，当前只有 ${childStatus.total_stars} 颗`,
      });
    }

    // 创建兑换记录
    const { data: redemption, error: redemptionError } = await supabase
      .from("redeemed_rewards")
      .insert([
        {
          reward_name: reward.name,
          reward_description: reward.description || null,
          stars_cost: reward.stars_cost,
          redeemed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (redemptionError) {
      throw createError({
        statusCode: 500,
        statusMessage: "创建兑换记录失败",
        data: redemptionError,
      });
    }

    // 更新儿童状态，扣除星星
    const { error: updateError } = await supabase
      .from("child_status")
      .update({
        total_stars: childStatus.total_stars - reward.stars_cost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", childStatus.id);

    if (updateError) {
      // 如果更新失败，需要删除兑换记录
      await supabase.from("redeemed_rewards").delete().eq("id", redemption.id);

      throw createError({
        statusCode: 500,
        statusMessage: "更新星星数量失败",
        data: updateError,
      });
    }

    return {
      success: true,
      data: redemption,
      message: body.custom_event
        ? `成功记录 ${reward.name}！消耗了 ${reward.stars_cost} 颗星星`
        : `成功兑换 ${reward.name}！消耗了 ${reward.stars_cost} 颗星星`,
    };
  } catch (error: any) {
    console.error("Error in redeem reward API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
