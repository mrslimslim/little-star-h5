import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { date } = query;

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    let queryBuilder = supabase
      .from("redeemed_rewards")
      .select("*")
      .order("redeemed_at", { ascending: false });

    // 如果指定了日期，按日期过滤
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      queryBuilder = queryBuilder
        .gte("redeemed_at", startDate.toISOString())
        .lt("redeemed_at", endDate.toISOString());
    }

    const { data: redemptions, error } = await queryBuilder;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取兑换记录失败",
        data: error,
      });
    }

    return {
      success: true,
      data: redemptions || [],
    };
  } catch (error: any) {
    console.error("Error in get redeemed rewards API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
