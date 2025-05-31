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
      .select(
        `
        *,
        completed_tasks (*)
      `
      )
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

    // 支持分页参数
    if (query.from !== undefined && query.to !== undefined) {
      const from = parseInt(query.from as string);
      const to = parseInt(query.to as string);
      queryBuilder = queryBuilder.range(from, to);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "获取每日记录失败",
        data: error,
      });
    }

    // 为每个记录计算当日消耗和净增
    const recordsWithSpending = await Promise.all(
      (data || []).map(async (record) => {
        // 获取当日的兑换记录
        const startDate = new Date(`${record.date}T00:00:00Z`);
        const endDate = new Date(`${record.date}T23:59:59.999Z`);

        const { data: redemptions } = await supabase
          .from("redeemed_rewards")
          .select("stars_cost")
          .gte("redeemed_at", startDate.toISOString())
          .lte("redeemed_at", endDate.toISOString());

        const totalSpent =
          redemptions?.reduce((sum, r) => sum + r.stars_cost, 0) || 0;
        const netStars = record.total_stars_earned_today - totalSpent;

        return {
          ...record,
          total_stars_spent_today: totalSpent,
          net_stars_today: netStars,
        };
      })
    );

    // 查找有兑换记录但没有学习记录的日期
    let redemptionQueryBuilder = supabase
      .from("redeemed_rewards")
      .select("redeemed_at, stars_cost");

    // 应用相同的日期范围过滤
    if (query.start_date) {
      redemptionQueryBuilder = redemptionQueryBuilder.gte(
        "redeemed_at",
        `${query.start_date}T00:00:00Z`
      );
    }
    if (query.end_date) {
      redemptionQueryBuilder = redemptionQueryBuilder.lte(
        "redeemed_at",
        `${query.end_date}T23:59:59.999Z`
      );
    }
    if (query.date) {
      const startDate = new Date(`${query.date}T00:00:00Z`);
      const endDate = new Date(`${query.date}T23:59:59.999Z`);
      redemptionQueryBuilder = redemptionQueryBuilder
        .gte("redeemed_at", startDate.toISOString())
        .lte("redeemed_at", endDate.toISOString());
    }

    const { data: allRedemptions } = await redemptionQueryBuilder;

    if (allRedemptions && allRedemptions.length > 0) {
      // 按日期分组兑换记录
      const redemptionsByDate = new Map<string, number>();

      allRedemptions.forEach((redemption) => {
        const date = new Date(redemption.redeemed_at)
          .toISOString()
          .split("T")[0];
        const currentTotal = redemptionsByDate.get(date) || 0;
        redemptionsByDate.set(date, currentTotal + redemption.stars_cost);
      });

      // 找出已有学习记录的日期
      const existingDates = new Set(
        recordsWithSpending.map((record) => record.date)
      );

      // 为只有兑换记录的日期创建虚拟记录
      const virtualRecords = Array.from(redemptionsByDate.entries())
        .filter(([date]) => !existingDates.has(date))
        .map(([date, totalSpent]) => ({
          id: `virtual-${date}`,
          date,
          total_stars_earned_today: 0,
          total_stars_spent_today: totalSpent,
          net_stars_today: -totalSpent,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_tasks: [],
        }));

      // 合并真实记录和虚拟记录
      const allRecords = [...recordsWithSpending, ...virtualRecords];

      // 重新排序
      allRecords.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // 如果有分页参数，应用分页
      if (query.from !== undefined && query.to !== undefined) {
        const from = parseInt(query.from as string);
        const to = parseInt(query.to as string);
        return {
          success: true,
          data: allRecords.slice(from, to + 1),
        };
      }

      return {
        success: true,
        data: allRecords,
      };
    }

    return {
      success: true,
      data: recordsWithSpending,
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
