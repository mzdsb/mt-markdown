import { ref, computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import DOMPurify from 'dompurify'

// 注册所有支持的语言
hljs.registerLanguage('javascript', javascript)

// Markdown解析配置
const configureMarked = () => {
  marked.setOptions({
    highlight: (code, lang) => {
      try {
        // 优先使用指定语言高亮
        if (hljs.getLanguage(lang)) {
          return hljs.highlight(lang, code).value
        }
        // 回退到自动检测
        return hljs.highlightAuto(code).value
      } catch (error) {
        console.error('代码高亮错误:', error)
        return code // 返回原始代码作为降级方案
      }
    },
    langPrefix: 'hljs language-',
    mangle: false,
    headerIds: false,
    // 启用表格支持
    tables: true,
    // 启用任务列表支持
    gfm: true,
    // 启用其他GFM功能
    breaks: true,
    pedantic: false,
    sanitize: false // 禁用内置sanitize，使用DOMPurify
  })
}

// 安全HTML配置
const getSanitizeConfig = () => {
  const baseTags = [
    'pre', 'code', 'span', 'p', 'em', 'i', 'strong', 'b', 'a', 
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'hr', 'br', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'input', 'del', 'ins', 'sub', 'sup'
  ]
  const baseAttrs = ['class', 'style', 'href', 'target', 'src', 'alt', 'title', 'checked', 'disabled', 'type']

  return {
    ALLOWED_TAGS: baseTags,
    ALLOWED_ATTR: baseAttrs,
    ADD_ATTR: ['class'],
    ALLOWED_CLASS_REGEX: /^(hljs|language-|task-list-item|contains-task-list)/
  }
}

// Markdown编辑器组合式函数
export function useMarkdown(initialContent = '') {
  configureMarked()
  const sanitizeConfig = getSanitizeConfig()

  const markdown = ref(initialContent || `# Hello MT Markdown

这是一个Markdown编辑器
`)

  const html = computed(() => {
    try {
      const rawHtml = marked.parse(markdown.value)
      return DOMPurify.sanitize(rawHtml, sanitizeConfig)
    } catch (error) {
      console.error('Markdown解析错误:', error)
      return ''
    }
  })

  return { 
    markdown, 
    html,
    updateContent: (content) => markdown.value = content
  }
}
