<!--
  Milkdown 编辑器组件 (v2.0)
  功能：
  1. 基于 Milkdown 的 WYSIWYG 编辑体验
  2. 支持 Markdown 语法和实时预览
  3. 代码语法高亮
  4. 表格支持
  5. 列表支持
  6. 自动连接主题系统
-->
<template>
  <div class="milkdown-editor-container" :data-theme="currentTheme">
    <!-- 版本标签 -->
    <div class="version-badge">v2.0</div>

    <!-- Milkdown 编辑器容器 -->
    <div ref="editorRef" class="milkdown-wrapper">
      <!-- 工具栏 -->
      <div class="editor-toolbar">
        <div class="button-group">
          <button class="icon-btn"
            @click="handleImport"
            title="导入Markdown文件">
            <span class="icon">📁</span>
            <span class="text">导入</span>
          </button>
          <button class="icon-btn" @click="handleExport" title="导出当前内容">
            <span class="icon">💾</span>
            <span class="text">导出</span>
          </button>
        </div>
        <transition name="fade">
          <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
        </transition>
      </div>

      <!-- 拖拽区域（仅在需要时显示） -->
      <transition name="fade">
        <div
          v-show="isShowDrag"
          ref="dropZone"
          class="drop-overlay"
          @dragenter.prevent="drag.handleDragEnter"
          @dragleave.prevent="drag.handleDragLeave"
          @dragover.prevent="drag.handleDragOver"
          @drop.prevent="drag.handleDrop">
          <div class="drop-content">
            <div class="drop-icon">⬆️</div>
            <p class="drop-text">松开上传文件</p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject, watch, nextTick } from 'vue'
import { Editor, defaultValueCtx, editorViewCtx, parserCtx, serializerCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { initThemeAdapter, applyThemeToEditor } from '../../lib/milkdown/theme-adapter'
import { useFileHandler } from '../../composables/useFileHandler'
import { useDragAndDrop } from '../../composables/drag'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 注入主题
const { theme } = inject('theme')
const currentTheme = ref(theme.value || 'light')

// 编辑器引用
const editorRef = ref(null)
let editorInstance = null
let updateHandler = null

// 文件处理
const {
  fileContent,
  errorMessage,
  openFileDialog,
  exportFile,
  handleFile,
} = useFileHandler()

// 拖拽上传
const isShowDrag = ref(false)
const dropZone = ref(null)
const drag = useDragAndDrop((file) => {
  isShowDrag.value = false
  handleFile(file)
  if (file && editorInstance) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      updateEditorContent(content)
    }
    reader.readAsText(file)
  }
})

// 监听文件内容变化
watch(fileContent, async (newContent) => {
  isShowDrag.value = false
  if (newContent && editorInstance) {
    await nextTick()
    updateEditorContent(newContent)
  }
})

// 监听主题变化
watch(() => theme.value, (newTheme) => {
  currentTheme.value = newTheme
  if (editorRef.value) {
    applyThemeToEditor(editorRef.value, newTheme)
  }
})

/**
 * 更新编辑器内容
 */
async function updateEditorContent(content) {
  if (!editorInstance) return

  try {
    const view = editorInstance.ctx.get(editorViewCtx)
    const parser = editorInstance.ctx.get(parserCtx)

    // 解析新的 markdown 内容
    const doc = parser(content)

    // 替换整个文档
    const tr = view.state.tr.replaceWith(
      0,
      view.state.doc.content.size,
      doc
    )

    view.dispatch(tr)
  } catch (error) {
    console.error('[MilkdownEditor] 更新内容失败:', error)
  }
}

/**
 * 获取编辑器当前的 Markdown 内容
 */
function getEditorContent() {
  if (!editorInstance) return ''
  try {
    const view = editorInstance.ctx.get(editorViewCtx)
    const serializer = editorInstance.ctx.get(serializerCtx)
    return serializer(view.state.doc)
  } catch (error) {
    console.error('[MilkdownEditor] 获取内容失败:', error)
    return ''
  }
}

/**
 * 初始化 Milkdown 编辑器
 */
async function initEditor() {
  if (!editorRef.value) return

  // 初始化主题适配器
  initThemeAdapter()

  try {
    // 创建编辑器实例
    editorInstance = await Editor.make()
      .config((ctx) => {
        // 设置默认值
        ctx.set(defaultValueCtx, props.modelValue || '')
      })
      .use(commonmark)
      .use(gfm)
      .create()

    // 挂载编辑器
    await editorInstance.mount(editorRef.value)

    // 应用主题
    applyThemeToEditor(editorRef.value, currentTheme.value)

    // 监听编辑器变化 - 通过覆盖 dispatch 来捕获所有事务
    const view = editorInstance.ctx.get(editorViewCtx)
    const originalDispatch = view.dispatch.bind(view)

    updateHandler = function(tr) {
      // 先执行原始 dispatch
      originalDispatch(tr)

      // 然后同步内容
      try {
        const serializer = editorInstance.ctx.get(serializerCtx)
        const markdown = serializer(view.state.doc)
        emit('update:modelValue', markdown)
      } catch (error) {
        console.error('[MilkdownEditor] 序列化失败:', error)
      }
    }
    // 保存原始 dispatch 方法以便恢复
    updateHandler.originalDispatch = originalDispatch

    // 覆盖 dispatch 方法
    view.dispatch = updateHandler

    // 初始同步内容
    try {
      const serializer = editorInstance.ctx.get(serializerCtx)
      const markdown = serializer(view.state.doc)
      emit('update:modelValue', markdown)
    } catch (error) {
      console.error('[MilkdownEditor] 初始序列化失败:', error)
    }

    console.log('[MilkdownEditor] 初始化成功')
  } catch (error) {
    console.error('[MilkdownEditor] 初始化失败:', error)
  }
}

/**
 * 销毁编辑器
 */
function destroyEditor() {
  if (editorInstance) {
    try {
      // 恢复原始 dispatch 方法
      const view = editorInstance.ctx.get(editorViewCtx)
      if (view && updateHandler && updateHandler.originalDispatch) {
        view.dispatch = updateHandler.originalDispatch
      }

      editorInstance.destroy()
    } catch (error) {
      console.error('[MilkdownEditor] 销毁失败:', error)
    }
    editorInstance = null
    updateHandler = null
  }
}

/**
 * 处理导入
 */
function handleImport() {
  isShowDrag.value = true
  openFileDialog()
}

/**
 * 处理导出
 */
function handleExport() {
  const content = getEditorContent()
  if (content) {
    exportFile(content)
  }
}

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  const currentContent = getEditorContent()
  if (newVal !== currentContent) {
    updateEditorContent(newVal)
  }
})

// 初始化拖拽和编辑器
onMounted(() => {
  initEditor()
  if (dropZone.value) {
    drag.initDragAndDrop(dropZone.value)
  }
})

// 清理
onBeforeUnmount(() => {
  destroyEditor()
})
</script>

<style scoped>
.milkdown-editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--app-bg);
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

/* 版本标签 */
.version-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  pointer-events: none;
}

/* 编辑器包装 */
.milkdown-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-height: 300px;
}

/* 工具栏 */
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--app-bg);
  border-bottom: 1px solid var(--border-color);
  min-height: 44px;
  z-index: 5;
}

.button-group {
  display: flex;
  gap: 8px;
}

.icon-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: var(--code-bg);
  border-color: var(--link-color);
}

.icon-btn .icon {
  font-size: 16px;
}

.icon-btn .text {
  font-size: 12px;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-left: 12px;
}

/* 拖拽区域 */
.drop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 123, 255, 0.1);
  border: 2px dashed var(--link-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  cursor: copy;
}

.drop-content {
  text-align: center;
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.drop-text {
  font-size: 16px;
  color: var(--text-primary);
}

/* Milkdown 编辑器基础样式 */
.milkdown-wrapper :deep(.milkdown) {
  outline: none;
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 200px;
}

/* ProseMirror 样式适配 */
.milkdown-wrapper :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
  line-height: 1.6;
}

.milkdown-wrapper :deep(.ProseMirror p) {
  margin: 8px 0;
}

.milkdown-wrapper :deep(.ProseMirror:focus) {
  outline: none;
}

/* ProseMirror 占位符 */
.milkdown-wrapper :deep(.ProseMirror p.is-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--text-secondary);
  pointer-events: none;
  height: 0;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
