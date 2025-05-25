import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 获取儿童状态，如果不存在则创建默认状态
    let { data, error } = await supabase
      .from("child_status")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code === "PGRST116") {
      // 如果没有记录，创建默认记录
      const { data: newData, error: insertError } = await supabase
        .from("child_status")
        .insert([
          {
            total_stars: 0,
            available_stars: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw createError({
          statusCode: 500,
          statusMessage: "创建儿童状态失败",
          data: insertError,
        });
      }

      data = newData;
    } else if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取儿童状态失败",
        data: error,
      });
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Error in child status API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
