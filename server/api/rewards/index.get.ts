import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    let queryBuilder = supabase
      .from("rewards")
      .select("*")
      .order("stars_cost", { ascending: true });

    const { data, error } = await queryBuilder;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取奖励列表失败",
        data: error,
      });
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Error in rewards API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
