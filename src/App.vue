<!-- src/App.vue -->
<script setup>
import { ref, shallowRef, watch } from 'vue'
import MTMarkdownV1 from './components/v1/MTMarkdown.vue'
import MTMarkdownV2 from './components/v2/MilkdownEditor.vue'
import StatusBar from './components/StatusBar.vue'
import { useTheme } from './composables/theme'

// 初始化主题 - 直接调用确保provide生效
const { theme } = useTheme()
const content = ref('# 欢迎使用 MT Markdown\n\n这是一个基于 Vue 3 的 Markdown 编辑器。\n\n- 支持实时预览\n- 支持代码高亮\n- 支持主题切换\n- 支持 v1 和 v2 两个版本\n\n```javascript\nconsole.log("Hello, MT Markdown!");\n```\n')

// 编辑器版本: 'v1' | 'v2'
const editorVersion = ref('v2')

// 使用 shallowRef 避免深层响应式，提高组件切换性能
const currentEditor = shallowRef(MTMarkdownV2)

// 监听版本切换
watch(editorVersion, (newVersion) => {
  currentEditor.value = newVersion === 'v1' ? MTMarkdownV1 : MTMarkdownV2
})

// 切换编辑器版本
function toggleVersion() {
  editorVersion.value = editorVersion.value === 'v1' ? 'v2' : 'v1'
}
</script>

<template>
  <div class="app-container" :data-theme="theme">
    <!-- 版本切换器 -->
    <div class="version-switcher">
      <div class="switcher-info">
        <span class="label">编辑器版本:</span>
        <span class="version-badge" :class="{ active: editorVersion === 'v1' }">v1 (Textarea)</span>
        <span class="version-badge" :class="{ active: editorVersion === 'v2' }">v2 (Milkdown)</span>
      </div>
      <button class="switch-btn" @click="toggleVersion">
        <span class="icon">🔄</span>
        切换到 {{ editorVersion === 'v1' ? 'v2' : 'v1' }}
      </button>
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-wrapper">
      <component :is="currentEditor" v-model="content" />
    </div>

    <!-- 状态栏 -->
    <StatusBar :content="content" />
  </div>
</template>

<style>
.app-container {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: var(--app-bg);
  transition: background 0.3s ease;
}

/* 版本切换器 */
.version-switcher {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--app-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 10px;
}

.switcher-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switcher-info .label {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.switcher-info .version-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background-color: var(--code-bg);
  color: var(--text-secondary);
  transition: all 0.2s;
  cursor: pointer;
}

.switcher-info .version-badge.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: var(--link-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.switch-btn:active {
  transform: translateY(0);
}

.switch-btn .icon {
  font-size: 16px;
}

/* 编辑器包装 */
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
