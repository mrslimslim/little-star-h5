import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 验证请求数据
    if (!body.name || typeof body.name !== "string") {
      throw createError({
        statusCode: 400,
        statusMessage: "任务名称是必需的",
      });
    }

    if (
      !body.default_stars ||
      body.default_stars < 1 ||
      body.default_stars > 10
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: "星星数量必须在1-10之间",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 创建新任务
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          name: body.name.trim(),
          default_stars: body.default_stars,
          icon: body.icon || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // 唯一约束违反
        throw createError({
          statusCode: 409,
          statusMessage: "任务名称已存在",
        });
      }
      throw createError({
        statusCode: 500,
        statusMessage: "创建任务失败",
        data: error,
      });
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error in create task API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
