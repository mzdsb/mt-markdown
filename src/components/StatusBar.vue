<!-- 
  状态栏组件
  功能：
  1. 显示当前文档字符数(不含空格)
  2. 显示当前文档行数
  3. 支持主题切换
-->
<script setup>
import { computed, inject } from 'vue'

const { theme, toggleTheme } = inject('theme')
const props = defineProps({
  content: String
})

/**
 * 计算字符数(不含空格和换行)
 * @returns {number} 字符总数
 */
const charCount = computed(() => {
  return props.content.replace(/[\s\n]/g, '').length // 过滤空字符
})
</script>

<template>
  <div class="status-bar" :data-theme="theme">
    <div class="stats">
      <span>字符数：{{ charCount }}</span>
      <span>行数：{{ content.split('\n').length }}</span>
    </div>
    <button 
      class="theme-toggle" 
      @click="toggleTheme"
      :title="theme === 'light' ? '切换深色主题' : '切换明亮主题'"
      aria-label="主题切换按钮"
    >
      {{ theme === 'light' ? '🌙' : '☀️' }}
    </button>
  </div>
</template>

<style scoped>
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  transition: background 0.3s ease, border-color 0.3s ease;
}

.stats {
  display: flex;
  gap: 20px;
  color: var(--text-primary);
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.3s ease;
}

.theme-toggle:hover {
  transform: scale(1.2);
}
</style>
