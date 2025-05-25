import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";
import { startOfWeek, startOfMonth, format } from "date-fns";

export default defineEventHandler(async (event) => {
  try {
    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    const now = new Date();
    const weekStart = format(
      startOfWeek(now, { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
    const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
    const today = format(now, "yyyy-MM-dd");

    // 获取今天的记录
    const { data: todayRecord } = await supabase
      .from("daily_records")
      .select("total_stars_earned_today")
      .eq("date", today)
      .single();

    // 获取本周的统计
    const { data: weekRecords } = await supabase
      .from("daily_records")
      .select("total_stars_earned_today")
      .gte("date", weekStart);

    // 获取本月的统计
    const { data: monthRecords } = await supabase
      .from("daily_records")
      .select("total_stars_earned_today")
      .gte("date", monthStart);

    // 获取总统计
    const { data: allRecords } = await supabase
      .from("daily_records")
      .select("total_stars_earned_today, date");

    // 获取儿童状态
    const { data: childStatus } = await supabase
      .from("child_status")
      .select("*")
      .limit(1)
      .single();

    // 计算统计数据
    const todayStars = todayRecord?.total_stars_earned_today || 0;
    const weekStars =
      weekRecords?.reduce(
        (sum, record) => sum + record.total_stars_earned_today,
        0
      ) || 0;
    const monthStars =
      monthRecords?.reduce(
        (sum, record) => sum + record.total_stars_earned_today,
        0
      ) || 0;
    const totalDays = allRecords?.length || 0;
    const totalStars = childStatus?.total_stars || 0;

    // 计算平均值
    const averageStarsPerDay =
      totalDays > 0 ? Math.round((totalStars / totalDays) * 10) / 10 : 0;
    const weekDays = weekRecords?.length || 0;
    const averageWeekStars =
      weekDays > 0 ? Math.round((weekStars / weekDays) * 10) / 10 : 0;

    return {
      success: true,
      data: {
        today: {
          stars: todayStars,
          hasRecord: !!todayRecord,
        },
        week: {
          stars: weekStars,
          days: weekDays,
          average: averageWeekStars,
        },
        month: {
          stars: monthStars,
          days: monthRecords?.length || 0,
        },
        total: {
          stars: totalStars,
          days: totalDays,
          averagePerDay: averageStarsPerDay,
        },
      },
    };
  } catch (error) {
    console.error("Error in statistics API:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "获取统计数据失败",
    });
  }
});
