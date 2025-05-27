import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const rewardId = getRouterParam(event, "id");
    const body = await readBody(event);

    if (!rewardId) {
      throw createError({
        statusCode: 400,
        statusMessage: "奖励ID是必需的",
      });
    }

    // 验证请求数据
    if (body.stars_cost !== undefined && body.stars_cost < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "星星消耗必须大于0",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 构建更新数据
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || null;
    if (body.stars_cost !== undefined) updateData.stars_cost = body.stars_cost;
    if (body.icon !== undefined) updateData.icon = body.icon || null;
    if (body.image_url !== undefined)
      updateData.image_url = body.image_url || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // 更新奖励
    const { data, error } = await supabase
      .from("rewards")
      .update(updateData)
      .eq("id", rewardId)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw createError({
          statusCode: 404,
          statusMessage: "奖励不存在",
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: "更新奖励失败",
        data: error,
      });
    }

    return {
      success: true,
      data,
      message: "奖励更新成功",
    };
  } catch (error: any) {
    console.error("Error in update reward API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
