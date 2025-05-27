import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 验证请求数据
    if (!body.name || !body.stars_cost) {
      throw createError({
        statusCode: 400,
        statusMessage: "奖励名称和星星消耗是必需的",
      });
    }

    if (body.stars_cost < 1) {
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

    // 创建奖励
    const { data, error } = await supabase
      .from("rewards")
      .insert([
        {
          name: body.name.trim(),
          description: body.description?.trim() || null,
          stars_cost: body.stars_cost,
          icon: body.icon || null,
          image_url: body.image_url || null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "创建奖励失败",
        data: error,
      });
    }

    return {
      success: true,
      data,
      message: "奖励创建成功",
    };
  } catch (error: any) {
    console.error("Error in create reward API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
