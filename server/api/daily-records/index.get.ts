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
      .from("daily_records")
      .select("*")
      .order("date", { ascending: false });

    // 如果指定了日期范围，添加过滤条件
    if (query.start_date) {
      queryBuilder = queryBuilder.gte("date", query.start_date as string);
    }
    if (query.end_date) {
      queryBuilder = queryBuilder.lte("date", query.end_date as string);
    }
    if (query.date) {
      queryBuilder = queryBuilder.eq("date", query.date as string);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取每日记录失败",
        data: error,
      });
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error("Error in daily records API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
