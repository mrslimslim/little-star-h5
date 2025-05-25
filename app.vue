<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
  >
    <!-- 应用头部 -->
    <AppHeader />

    <!-- 主要内容区域 -->
    <main class="container mx-auto px-4 py-6">
      <NuxtPage />
    </main>

    <!-- 全局加载指示器 -->
    <div
      v-if="pending"
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 shadow-xl">
        <div class="flex items-center space-x-3">
          <div class="animate-spin text-2xl">⭐</div>
          <span class="text-gray-600">加载中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入头部组件
import AppHeader from "~/components/Common/AppHeader.vue";

// 页面加载状态
const { pending } = useLazyAsyncData("app-init", async () => {
  // 这里可以进行一些全局初始化操作
  return true;
});

// 设置页面元信息
useHead({
  titleTemplate: "%s - 小星星学习记录",
  meta: [
    {
      name: "description",
      content: "帮助儿童记录学习成果，收集小星星，兑换奖励的可爱H5应用",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});
</script>

<style>
/* 全局样式已在 assets/css/main.css 中定义 */
</style>
