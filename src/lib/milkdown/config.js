/**
 * Milkdown 配置文件
 * 定义编辑器的默认配置和主题映射
 */

import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'

/**
 * 获取 Milkdown 默认配置
 */
export function getDefaultConfig() {
  return {
    // 使用 CommonMark + GFM 支持
    presets: [commonmark, gfm],

    // 编辑器功能开关
    features: {
      // 支持 GFM（表格、删除线等）
      gfm: true,
      // 支持代码块语法高亮
      syntaxHighlight: true,
      // 支持列表
      list: true,
      // 支持任务列表（复选框）
      taskList: true,
      // 支持数学公式（可选，需要额外依赖）
      math: false,
    },

    // 编辑器行为配置
    behavior: {
      // 默认段落类型
      defaultParagraph: 'paragraph',
      // 支持快捷键
      shortcuts: true,
      // 支持拼写检查（浏览器原生）
      spellCheck: true,
    },
  }
}

/**
 * 主题颜色映射
 * 将编辑器的 CSS 变量映射到 Milkdown 主题
 */
export const themeMapping = {
  light: {
    '--editor-background': 'var(--app-bg)',
    '--editor-text': 'var(--text-primary)',
    '--editor-border': 'var(--border-color)',
    '--editor-placeholder': 'var(--text-secondary)',
    '--editor-selection': 'var(--selection-color)',
    '--editor-code-bg': 'var(--code-bg)',
    '--editor-link': 'var(--link-color)',
  },
  dark: {
    '--editor-background': 'var(--app-bg)',
    '--editor-text': 'var(--text-primary)',
    '--editor-border': 'var(--border-color)',
    '--editor-placeholder': 'var(--text-secondary)',
    '--editor-selection': 'var(--selection-color)',
    '--editor-code-bg': 'var(--code-bg)',
    '--editor-link': 'var(--link-color)',
  },
}

/**
 * 获取当前主题配置
 * @param {string} theme - 当前主题名称（'light' | 'dark'）
 */
export function getThemeConfig(theme) {
  return themeMapping[theme] || themeMapping.light
}

/**
 * 代码语言列表
 * 用于代码块语言选择和高亮
 */
export const supportedLanguages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'html',
  'css',
  'json',
  'markdown',
  'bash',
  'sql',
  'yaml',
  'xml',
  'go',
  'rust',
  'php',
  'ruby',
]

/**
 * 获取编辑器占位符文本
 */
export function getPlaceholderText() {
  return '输入 Markdown 内容...'
}
