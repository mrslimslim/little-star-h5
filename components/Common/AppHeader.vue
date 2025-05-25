<template>
  <header class="app-header bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-lg">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- 左侧：标题和logo -->
        <div class="flex items-center space-x-3">
          <div class="text-3xl">🌟</div>
          <div>
            <h1 class="text-xl font-bold font-fredoka">小星星学习记录</h1>
            <p class="text-sm opacity-90">每天进步一点点</p>
          </div>
        </div>
        
        <!-- 右侧：星星显示 -->
        <div class="flex items-center space-x-4">
          <StarDisplay size="medium" />
          
          <!-- 设置按钮 -->
          <button 
            @click="$router.push('/settings/tasks')"
            class="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
            title="设置"
          >
            <div class="text-xl">⚙️</div>
          </button>
        </div>
      </div>
      
      <!-- 导航栏 -->
      <nav class="mt-4">
        <div class="flex space-x-1 bg-white/10 rounded-full p-1">
          <NuxtLink
            to="/"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/' }"
          >
            <span class="text-lg">📅</span>
            <span class="text-sm">日历</span>
          </NuxtLink>
          
          <NuxtLink
            to="/list"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/list' }"
          >
            <span class="text-lg">📋</span>
            <span class="text-sm">列表</span>
          </NuxtLink>
          
          <NuxtLink
            to="/rewards"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === '/rewards' }"
          >
            <span class="text-lg">🎁</span>
            <span class="text-sm">奖励</span>
          </NuxtLink>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// 导入星星显示组件
import StarDisplay from './StarDisplay.vue'
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-item {
  @apply flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-200 text-white/80 hover:text-white hover:bg-white/10;
  min-width: 80px;
}

.nav-item-active {
  @apply bg-white/20 text-white font-semibold;
}

.font-fredoka {
  font-family: 'Fredoka One', cursive;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .app-header .container {
    @apply px-3 py-3;
  }
  
  .app-header h1 {
    @apply text-lg;
  }
  
  .nav-item {
    @apply px-3 py-2;
    min-width: 70px;
  }
  
  .nav-item span:last-child {
    @apply text-xs;
  }
}
</style> 