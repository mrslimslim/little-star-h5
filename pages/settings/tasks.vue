<template>
  <div class="task-settings-page">
    <!-- 页面头部 -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <button 
          @click="$router.back()"
          class="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <span class="text-xl">⬅️</span>
        </button>
        
        <div class="text-center">
          <h2 class="text-xl font-bold text-gray-800">任务管理</h2>
          <p class="text-sm text-gray-500">管理预设任务</p>
        </div>
        
        <div class="w-10"></div> <!-- 占位元素，保持布局平衡 -->
      </div>
    </div>

    <!-- 添加新任务 -->
    <div class="mb-6 bg-white rounded-2xl p-6 shadow-lg">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <span class="text-xl mr-2">➕</span>
        添加新任务
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">任务名称</label>
          <input
            v-model="newTask.name"
            type="text"
            placeholder="输入任务名称"
            class="input-cute"
            @keyup.enter="createNewTask"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">默认星星数</label>
          <div class="flex items-center space-x-3">
            <button 
              @click="decreaseStars"
              class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <span class="text-gray-600 text-lg">-</span>
            </button>
            <span class="w-12 text-center font-semibold text-lg">{{ newTask.default_stars }}</span>
            <button 
              @click="increaseStars"
              class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <span class="text-gray-600 text-lg">+</span>
            </button>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">图标 (可选)</label>
          <div class="flex flex-wrap gap-2 mb-3">
            <button
              v-for="icon in iconOptions"
              :key="icon"
              @click="newTask.icon = icon"
              class="w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl hover:border-pink-300 transition-colors duration-200"
              :class="newTask.icon === icon ? 'border-pink-400 bg-pink-50' : 'border-gray-200'"
            >
              {{ icon }}
            </button>
          </div>
          <input
            v-model="newTask.icon"
            type="text"
            placeholder="或输入自定义图标"
            class="input-cute"
          />
        </div>
        
        <div v-if="formErrors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <ul class="text-sm text-red-600">
            <li v-for="error in formErrors" :key="error">• {{ error }}</li>
          </ul>
        </div>
        
        <button 
          @click="createNewTask"
          :disabled="isLoading || !newTask.name.trim()"
          class="btn-primary w-full"
          :class="{ 'opacity-50 cursor-not-allowed': isLoading || !newTask.name.trim() }"
        >
          <span v-if="isLoading">添加中...</span>
          <span v-else>添加任务</span>
        </button>
      </div>
    </div>

    <!-- 现有任务列表 -->
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-gray-800 flex items-center">
        <span class="text-xl mr-2">📋</span>
        现有任务 ({{ tasks.length }})
      </h3>
      
      <!-- 加载状态 -->
      <div v-if="isTasksLoading" class="text-center py-8">
        <div class="animate-spin text-4xl mb-2">⚙️</div>
        <p class="text-gray-500">加载任务中...</p>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="tasks.length === 0" class="text-center py-12 bg-white rounded-2xl shadow-lg">
        <div class="text-6xl mb-4">📝</div>
        <h4 class="text-lg font-semibold text-gray-800 mb-2">暂无任务</h4>
        <p class="text-gray-600">添加第一个预设任务吧！</p>
      </div>
      
      <!-- 任务卡片 -->
      <div v-else class="space-y-3">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-card"
          :class="{ 'opacity-75': editingTaskId === task.id }"
        >
          <!-- 正常显示模式 -->
          <div v-if="editingTaskId !== task.id" class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="task-icon">
                <span class="text-2xl">{{ task.icon || '📚' }}</span>
              </div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ task.name }}</h4>
                <p class="text-sm text-gray-500">默认奖励 {{ task.default_stars }} 颗星星</p>
                <p class="text-xs text-gray-400">创建于 {{ formatDate(task.created_at) }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                @click="startEdit(task)"
                class="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                title="编辑"
              >
                <span class="text-blue-600 text-sm">✏️</span>
              </button>
              <button 
                @click="confirmDelete(task)"
                class="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors duration-200"
                title="删除"
              >
                <span class="text-red-600 text-sm">🗑️</span>
              </button>
            </div>
          </div>
          
          <!-- 编辑模式 -->
          <div v-else class="space-y-3">
            <div>
              <input
                v-model="editForm.name"
                type="text"
                class="input-cute"
                placeholder="任务名称"
              />
            </div>
            
            <div class="flex items-center space-x-3">
              <label class="text-sm text-gray-600">星星数：</label>
              <button 
                @click="editForm.default_stars = Math.max(1, editForm.default_stars - 1)"
                class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-600">-</span>
              </button>
              <span class="w-8 text-center font-semibold">{{ editForm.default_stars }}</span>
              <button 
                @click="editForm.default_stars = Math.min(10, editForm.default_stars + 1)"
                class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <span class="text-gray-600">+</span>
              </button>
            </div>
            
            <div>
              <input
                v-model="editForm.icon"
                type="text"
                class="input-cute"
                placeholder="图标"
              />
            </div>
            
            <div class="flex space-x-2">
              <button 
                @click="saveEdit"
                :disabled="isLoading"
                class="btn-primary flex-1"
              >
                保存
              </button>
              <button 
                @click="cancelEdit"
                class="flex-1 py-2 px-4 rounded-full border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 初始化默认任务 -->
    <div v-if="tasks.length === 0" class="mt-6">
      <button 
        @click="initializeDefaultTasks"
        :disabled="isLoading"
        class="btn-secondary w-full"
      >
        <span v-if="isLoading">初始化中...</span>
        <span v-else>📚 初始化默认任务</span>
      </button>
    </div>

    <!-- 成功提示 -->
    <div 
      v-if="showSuccess"
      class="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-4">
        <div class="text-center">
          <div class="text-4xl mb-3">✅</div>
          <h4 class="text-lg font-bold text-gray-800 mb-2">操作成功！</h4>
          <p class="text-gray-600 mb-4">{{ successMessage }}</p>
          <button 
            @click="closeSuccess"
            class="btn-primary"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import type { Task, CreateTaskForm } from '~/types'

// 设置页面标题
useHead({
  title: '任务管理'
})

// 响应式状态
const editingTaskId = ref<string | null>(null)
const showSuccess = ref(false)
const successMessage = ref('')
const formErrors = ref<string[]>([])

// 新任务表单
const newTask = ref<CreateTaskForm>({
  name: '',
  default_stars: 1,
  icon: ''
})

// 编辑表单
const editForm = ref<CreateTaskForm>({
  name: '',
  default_stars: 1,
  icon: ''
})

// 使用 composables
const { 
  tasks, 
  isLoading: isTasksLoading, 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  validateTaskForm,
  createDefaultTasks
} = useTasks()

const isLoading = ref(false)

// 图标选项
const iconOptions = [
  '📚', '✏️', '🎹', '🧹', '🏠', '⚽', '😴', '🦷', 
  '🎨', '🔢', '🌟', '🎯', '💡', '🔬', '🌱', '🎵'
]

// 方法
const increaseStars = () => {
  if (newTask.value.default_stars < 10) {
    newTask.value.default_stars++
  }
}

const decreaseStars = () => {
  if (newTask.value.default_stars > 1) {
    newTask.value.default_stars--
  }
}

const createNewTask = async () => {
  if (isLoading.value) return
  
  formErrors.value = validateTaskForm(newTask.value)
  if (formErrors.value.length > 0) return
  
  try {
    isLoading.value = true
    
    const success = await createTask(newTask.value)
    
    if (success) {
      // 重置表单
      newTask.value = {
        name: '',
        default_stars: 1,
        icon: ''
      }
      formErrors.value = []
      
      successMessage.value = '任务添加成功！'
      showSuccess.value = true
    } else {
      alert('添加任务失败，请重试')
    }
  } catch (error) {
    console.error('Error creating task:', error)
    alert('添加任务失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const startEdit = (task: Task) => {
  editingTaskId.value = task.id
  editForm.value = {
    name: task.name,
    default_stars: task.default_stars,
    icon: task.icon || ''
  }
}

const cancelEdit = () => {
  editingTaskId.value = null
  editForm.value = {
    name: '',
    default_stars: 1,
    icon: ''
  }
}

const saveEdit = async () => {
  if (!editingTaskId.value || isLoading.value) return
  
  try {
    isLoading.value = true
    
    const success = await updateTask(editingTaskId.value, editForm.value)
    
    if (success) {
      editingTaskId.value = null
      successMessage.value = '任务更新成功！'
      showSuccess.value = true
    } else {
      alert('更新任务失败，请重试')
    }
  } catch (error) {
    console.error('Error updating task:', error)
    alert('更新任务失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = async (task: Task) => {
  if (!confirm(`确定要删除任务 "${task.name}" 吗？`)) return
  
  try {
    isLoading.value = true
    
    const success = await deleteTask(task.id)
    
    if (success) {
      successMessage.value = '任务删除成功！'
      showSuccess.value = true
    } else {
      alert('删除任务失败，请重试')
    }
  } catch (error) {
    console.error('Error deleting task:', error)
    alert('删除任务失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const initializeDefaultTasks = async () => {
  if (isLoading.value) return
  
  try {
    isLoading.value = true
    
    const success = await createDefaultTasks()
    
    if (success) {
      successMessage.value = '默认任务初始化成功！'
      showSuccess.value = true
    } else {
      alert('初始化失败，请重试')
    }
  } catch (error) {
    console.error('Error initializing default tasks:', error)
    alert('初始化失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy-MM-dd')
}

const closeSuccess = () => {
  showSuccess.value = false
  successMessage.value = ''
}

// 初始化
onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.task-settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.task-card {
  @apply bg-white rounded-xl p-4 border-2 border-gray-100 shadow-lg transition-all duration-200;
}

.task-icon {
  @apply w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .task-settings-page {
    padding: 0 1rem;
  }
  
  .task-card {
    @apply p-3;
  }
  
  .task-icon {
    @apply w-10 h-10;
  }
}
</style> 