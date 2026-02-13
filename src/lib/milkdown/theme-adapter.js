/**
 * Milkdown 主题适配器
 * 连接现有主题系统与 Milkdown 编辑器
 */

import { ref, watch } from 'vue'

/**
 * 创建主题适配器
 * 将项目的主题系统与 Milkdown 的主题变量连接
 *
 * @param {Ref<string>} themeRef - 主题响应式引用（'light' | 'dark'）
 * @returns {Object} 主题适配器对象
 */
export function createThemeAdapter(themeRef) {
  // 当前编辑器主题
  const editorTheme = ref('light')

  // 监听主题变化
  watch(
    themeRef,
    (newTheme) => {
      editorTheme.value = newTheme
      updateEditorTheme(newTheme)
    },
    { immediate: true }
  )

  return {
    editorTheme,
    updateEditorTheme,
    getThemeVariables,
  }
}

/**
 * 更新编辑器主题
 * @param {string} theme - 主题名称
 */
function updateEditorTheme(theme) {
  const editor = document.querySelector('.milkdown')
  if (!editor) return

  // 设置主题类名
  editor.classList.remove('theme-light', 'theme-dark')
  editor.classList.add(`theme-${theme}`)

  // 设置 data-theme 属性
  editor.setAttribute('data-theme', theme)

  // 更新 CSS 变量
  updateCSSVariables(theme)
}

/**
 * 更新 CSS 变量
 * @param {string} theme - 主题名称
 */
function updateCSSVariables(theme) {
  const root = document.documentElement
  const editor = document.querySelector('.milkdown')

  if (!editor) return

  // 获取当前主题的 CSS 变量值
  const variables = getThemeVariables(theme)

  // 应用到编辑器
  Object.entries(variables).forEach(([key, value]) => {
    editor.style.setProperty(key, value)
  })
}

/**
 * 获取主题 CSS 变量
 * @param {string} theme - 主题名称
 * @returns {Object} CSS 变量映射
 */
function getThemeVariables(theme) {
  const root = document.documentElement
  const style = getComputedStyle(root)

  // 基础颜色映射
  const baseColors = {
    light: {
      background: style.getPropertyValue('--app-bg').trim() || '#ffffff',
      text: style.getPropertyValue('--text-primary').trim() || '#333333',
      border: style.getPropertyValue('--border-color').trim() || '#e0e0e0',
      placeholder: style.getPropertyValue('--text-secondary').trim() || '#999999',
      selection: style.getPropertyValue('--selection-color').trim() || 'rgba(0, 123, 255, 0.2)',
      codeBg: style.getPropertyValue('--code-bg').trim() || '#f5f5f5',
      link: style.getPropertyValue('--link-color').trim() || '#0066cc',
    },
    dark: {
      background: style.getPropertyValue('--app-bg').trim() || '#1e1e1e',
      text: style.getPropertyValue('--text-primary').trim() || '#e0e0e0',
      border: style.getPropertyValue('--border-color').trim() || '#3a3a3a',
      placeholder: style.getPropertyValue('--text-secondary').trim() || '#888888',
      selection: style.getPropertyValue('--selection-color').trim() || 'rgba(100, 150, 255, 0.3)',
      codeBg: style.getPropertyValue('--code-bg').trim() || '#2d2d2d',
      link: style.getPropertyValue('--link-color').trim() || '#66aaff',
    },
  }

  return baseColors[theme] || baseColors.light
}

/**
 * 注入主题 CSS
 * 为 Milkdown 编辑器注入主题样式
 */
export function injectThemeCSS() {
  const styleId = 'milkdown-theme-adapter'

  // 如果已存在则不重复注入
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    /* Milkdown 主题适配样式 */
    .milkdown {
      /* 使用 CSS 变量以便动态更新 */
      --milkdown-bg: var(--editor-background, #ffffff);
      --milkdown-text: var(--editor-text, #333333);
      --milkdown-border: var(--editor-border, #e0e0e0);
      --milkdown-placeholder: var(--editor-placeholder, #999999);
      --milkdown-selection: var(--editor-selection, rgba(0, 123, 255, 0.2));
      --milkdown-code-bg: var(--editor-code-bg, #f5f5f5);
      --milkdown-link: var(--editor-link, #0066cc);

      background-color: var(--milkdown-bg);
      color: var(--milkdown-text);
      border: 1px solid var(--milkdown-border);
      border-radius: 4px;
      min-height: 400px;
      padding: 16px;
      outline: none;
      transition: background-color 0.3s, color 0.3s, border-color 0.3s;
    }

    .milkdown:focus {
      border-color: var(--milkdown-link);
      box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
    }

    /* 编辑器占位符 */
    .milkdown .placeholder {
      color: var(--milkdown-placeholder);
      pointer-events: none;
      position: absolute;
      user-select: none;
    }

    /* 选中文本 */
    .milkdown ::selection {
      background-color: var(--milkdown-selection);
    }

    /* 链接样式 */
    .milkdown a {
      color: var(--milkdown-link);
      text-decoration: underline;
      cursor: pointer;
    }

    .milkdown a:hover {
      opacity: 0.8;
    }

    /* 代码块样式 */
    .milkdown pre {
      background-color: var(--milkdown-code-bg);
      border: 1px solid var(--milkdown-border);
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
      margin: 8px 0;
    }

    .milkdown code {
      background-color: var(--milkdown-code-bg);
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }

    .milkdown pre code {
      background-color: transparent;
      padding: 0;
    }

    /* 表格样式 */
    .milkdown table {
      border-collapse: collapse;
      width: 100%;
      margin: 12px 0;
    }

    .milkdown table th,
    .milkdown table td {
      border: 1px solid var(--milkdown-border);
      padding: 8px 12px;
      text-align: left;
    }

    .milkdown table th {
      background-color: var(--milkdown-code-bg);
      font-weight: 600;
    }

    /* 引用块样式 */
    .milkdown blockquote {
      border-left: 4px solid var(--milkdown-link);
      padding-left: 16px;
      margin: 12px 0;
      color: var(--milkdown-placeholder);
      font-style: italic;
    }

    /* 分隔线样式 */
    .milkdown hr {
      border: none;
      border-top: 2px solid var(--milkdown-border);
      margin: 20px 0;
    }

    /* 列表样式 */
    .milkdown ul,
    .milkdown ol {
      margin: 8px 0;
      padding-left: 24px;
    }

    .milkdown li {
      margin: 4px 0;
    }

    /* 任务列表样式 */
    .milkdown input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
    }

    /* 深色主题特定样式 */
    .milkdown[data-theme="dark"] {
      /* 深色主题如果有特殊需求可以在这里添加 */
    }
  `

  document.head.appendChild(style)
}

/**
 * 初始化主题适配器
 * 在应用启动时调用
 */
export function initThemeAdapter() {
  injectThemeCSS()
}

/**
 * 为编辑器应用主题
 * @param {HTMLElement} editorElement - 编辑器 DOM 元素
 * @param {string} theme - 主题名称
 */
export function applyThemeToEditor(editorElement, theme) {
  if (!editorElement) return

  // 设置 data-theme 属性
  editorElement.setAttribute('data-theme', theme)

  // 应用 CSS 变量
  const variables = getThemeVariables(theme)
  Object.entries(variables).forEach(([key, value]) => {
    editorElement.style.setProperty(`--editor-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`, value)
  })
}
