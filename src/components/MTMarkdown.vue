<!-- 
  Markdown编辑器主组件
  功能：
  1. 提供Markdown编辑和实时预览功能
  2. 支持文件导入/导出
  3. 支持拖拽上传文件
  4. 提供代码高亮功能
-->
<template>
  <div class="editor-container" :data-theme="theme">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="button-group">
        <button class="icon-btn" 
          @click=" () => {
            isShowDrag = true;
            openFileDialog();
          }"
          title="导入Markdown文件">
          <span class="icon">📁</span>
          <span class="text">导入</span>
        </button>
        <button class="icon-btn" @click="exportFile(markdown)" title="导出当前内容">
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

    <!-- 编辑区 -->
    <textarea v-model="markdown" class="editor" placeholder="输入Markdown..." @change="updateHighlight" @contextmenu.prevent="rightClick" @keydown="handleKeydown" ref="textareaRef"></textarea>

    <!-- 预览区 -->
    <div class="preview" v-html="html"></div>

    <!-- 右键菜单 -->
     <RightClickMenu 
     v-if="isMenuShow"
      :left="menuLeft"
      :top="menuTop"
      :selection-start="selectionStart"
      :selection-end="selectionEnd"
      :current-value="content"
      @update-content="updateContent"
      @close-menu="isMenuShow = false"
     ></RightClickMenu>
  </div>
</template>

<script setup >
import { ref, nextTick, watch, onMounted, inject, shallowReactive } from 'vue';
import { useMarkdown } from '../composables/useMarkdown';
import { useFileHandler } from '../composables/useFileHandler';
import { useDragAndDrop } from '../composables/drag';

import rightClickMenu from './rightClickMenu.vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import RightClickMenu from './rightClickMenu.vue';

// 获取注入的主题
const { theme } = inject('theme');

// 监听主题变化
watch(() => theme.value, (newVal) => {
  // 仅更新编辑器容器的主题
  const editor = document.querySelector('.editor-container');
  if (editor) {
    editor.setAttribute('data-theme', newVal);
  }
});

/**
 * Markdown处理相关逻辑
 * 使用useMarkdown组合式API获取markdown和html响应式引用
 */
const { markdown, html } = useMarkdown();

// 同步外部v-model和内部markdown
watch(() => props.modelValue, (newVal) => {
  if (newVal !== markdown.value) {
    markdown.value = newVal;
  }
});

watch(markdown, (newVal) => {
  emit('update:modelValue', newVal);
});
let observer = null;

/**
 * 文件处理相关逻辑
 * 包括文件导入/导出和错误处理
 */
const { 
  fileContent,
  errorMessage,
  openFileDialog,
  exportFile,
  handleFile
} = useFileHandler();

/**
 * 监听文件内容变化
 * 当有新文件导入时更新markdown内容并刷新高亮
 */
watch(fileContent, async (newFiles) => {
    isShowDrag.value = false;
    if (newFiles) {
      markdown.value = newFiles;
      updateHighlight();
    }else{
      console.error(errorMessage.value);
    }
})

/**
 * 拖拽上传功能
 * 使用useDragAndDrop组合式API实现文件拖拽上传
 */
const isShowDrag = ref(false);
const dropZone = ref(null);
const drag = useDragAndDrop((file) => {
  isShowDrag.value = false;
  handleFile(file);
});

onMounted(() => {
  if (dropZone.value) {
    drag.initDragAndDrop(dropZone.value);
  }
});

/**
 * 更新代码高亮
 * 使用MutationObserver监听DOM变化并应用高亮
 * 使用highlight.js实现代码语法高亮
 */
function updateHighlight() {
  nextTick(() => {
    const preview = document.querySelector('.preview');
    if (preview) {
      preview.querySelectorAll('pre code').forEach(block => {
        try {
          hljs.highlightElement(block);
        } catch (error) {
          console.error('代码高亮失败:', error);
        }
      });
    }
  });
}

// 初始化高亮
updateHighlight();

// 右键菜单
const isMenuShow = ref(false);
// 引用
const textareaRef = ref(null);
// 文本内容
const content = markdown;
// 右键菜单位置
const menuLeft = ref(0);
const menuTop = ref(0);
let selectionStart = ref(0);
let selectionEnd = ref(0);

function rightClick(e) {
  if (!textareaRef.value) return;
  // 记录选区
  selectionStart.value = textareaRef.value.selectionStart;
  selectionEnd.value = textareaRef.value.selectionEnd;
  // 设置菜单位置
  menuLeft.value = e.clientX;
  menuTop.value = e.clientY;
  isMenuShow.value = true;
}
// 点击其他地方隐藏右键菜单
document.addEventListener('click', () => {
  isMenuShow.value = false;
})

function updateContent(newValue, cursorPos){
  content.value = newValue;
  // 光标定位（需等待DOM更新）
  nextTick(() => {
    if (textareaRef.value && cursorPos !== undefined) {
      textareaRef.value.selectionStart = cursorPos;
      textareaRef.value.selectionEnd = cursorPos;
    }
  });
}

/**
 * 智能列表检测功能
 * 检测光标前的列表格式并在回车时自动插入相应的列表项
 */
function handleKeydown(e) {
  // 只处理回车键
  if (e.key !== 'Enter') return;
  
  const textarea = textareaRef.value;
  if (!textarea) return;
  
  const { selectionStart, value } = textarea;
  
  // 获取当前行内容（从行首到光标位置）
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
  const currentLine = value.substring(lineStart, selectionStart);
  
  // 检测列表格式
  const listMatch = detectListFormat(currentLine);
  
  if (listMatch) {
    e.preventDefault(); // 阻止默认回车行为
    
    const { type, prefix, number } = listMatch;
    
    // 根据列表类型生成新的列表项
    let newPrefix;
    if (type === 'checkbox') {
      newPrefix = prefix; // 保持相同的复选框状态
    } else if (type === 'ordered') {
      newPrefix = `${number + 1}. `; // 递增编号
    } else {
      newPrefix = prefix; // 无序列表保持相同前缀
    }
    
    // 插入新的列表项
    const newText = value.substring(0, selectionStart) + '\n' + newPrefix + value.substring(selectionStart);
    
    // 更新内容并设置光标位置
    const newCursorPos = selectionStart + newPrefix.length + 1; // +1 是因为换行符
    updateContent(newText, newCursorPos);
  }
}

/**
 * 检测列表格式
 * @param {string} line - 当前行内容
 * @returns {Object|null} 列表信息或null
 */
function detectListFormat(line) {
  // 检测复选框格式：- [ ] 或 - [x]
  const checkboxMatch = line.match(/^(\s*)(- \[[ x]\]\s+)/);
  if (checkboxMatch) {
    return {
      type: 'checkbox',
      prefix: checkboxMatch[1] + checkboxMatch[2], // 保持缩进和前缀
      number: null
    };
  }
  
  // 检测有序列表格式：1. 2. 等
  const orderedMatch = line.match(/^(\s*)(\d+)\.\s+/);
  if (orderedMatch) {
    return {
      type: 'ordered',
      prefix: orderedMatch[1], // 缩进
      number: parseInt(orderedMatch[2])
    };
  }
  
  // 检测无序列表格式：- 或 * 或 +
  const unorderedMatch = line.match(/^(\s*)([-*+]\s+)/);
  if (unorderedMatch) {
    return {
      type: 'unordered',
      prefix: unorderedMatch[1] + unorderedMatch[2], // 保持缩进和前缀
      number: null
    };
  }
  
  return null;
}

// 监听markdown变化自动高亮
watch(markdown, () => {
  updateHighlight();
});
</script>

<style scoped>
@import '../assets/styles/MTMarkdown.css';
</style>
