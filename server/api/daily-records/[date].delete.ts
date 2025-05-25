import { createClient } from "@supabase/supabase-js";
import type { Database } from "~/types/supabase";

export default defineEventHandler(async (event) => {
  try {
    const date = getRouterParam(event, "date");

    if (!date) {
      throw createError({
        statusCode: 400,
        statusMessage: "日期参数必填",
      });
    }

    // 获取 Supabase 客户端
    const config = useRuntimeConfig();
    const supabase = createClient<Database>(
      config.supabaseUrl,
      config.supabaseServiceKey
    );

    // 首先获取记录信息，用于星星扣减
    const { data: record, error: fetchError } = await supabase
      .from("daily_records")
      .select("*")
      .eq("date", date)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw createError({
          statusCode: 404,
          statusMessage: "记录不存在",
        });
      }
      throw fetchError;
    }

    // 删除记录（级联删除会自动删除completed_tasks）
    const { error: deleteError } = await supabase
      .from("daily_records")
      .delete()
      .eq("date", date);

    if (deleteError) {
      throw deleteError;
    }

    // 更新儿童状态中的星星总数（扣减）
    if (record.total_stars_earned_today > 0) {
      const { data: childStatus, error: statusError } = await supabase
        .from("child_status")
        .select("total_stars")
        .limit(1)
        .single();

      if (!statusError && childStatus) {
        const newTotal = Math.max(
          0,
          childStatus.total_stars - record.total_stars_earned_today
        );

        await supabase
          .from("child_status")
          .update({ total_stars: newTotal })
          .eq("id", childStatus.id);
      }
    }

    return {
      success: true,
      message: "每日记录删除成功",
    };
  } catch (error: any) {
    console.error("Error in delete daily record API:", error);
    if (error.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: "服务器内部错误",
    });
  }
});
