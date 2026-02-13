/**
 * Milkdown 插件管理
 * 集成和配置 Milkdown 的各种插件
 */

import {
  $inputRule,
  $command,
  $nodeView,
  $mark,
  $node,
} from '@milkdown/plugin-manager'
import { inputRules } from '@milkdown/plugin-input-rule'
import { gfm } from '@milkdown/preset-gfm'

/**
 * 插件注册列表
 */
export const plugins = []

/**
 * 注册自定义快捷键
 */
export function registerShortcuts() {
  return [
    // 标题快捷键
    $command('heading1', (ctx) => {
      const command = ctx.get(gfm.key).heading1
      return command
    }),
    $command('heading2', (ctx) => {
      const command = ctx.get(gfm.key).heading2
      return command
    }),
    $command('heading3', (ctx) => {
      const command = ctx.get(gfm.key).heading3
      return command
    }),

    // 格式化快捷键
    $command('bold', (ctx) => {
      const command = ctx.get(gfm.key).bold
      return command
    }),
    $command('italic', (ctx) => {
      const command = ctx.get(gfm.key).italic
      return command
    }),
    $command('strike', (ctx) => {
      const command = ctx.get(gfm.key).strike
      return command
    }),
    $command('code', (ctx) => {
      const command = ctx.get(gfm.key).codeInline
      return command
    }),

    // 列表快捷键
    $command('bulletList', (ctx) => {
      const command = ctx.get(gfm.key).bulletList
      return command
    }),
    $command('orderedList', (ctx) => {
      const command = ctx.get(gfm.key).orderedList
      return command
    }),
    $command('taskList', (ctx) => {
      const command = ctx.get(gfm.key).taskList
      return command
    }),

    // 其他快捷键
    $command('blockquote', (ctx) => {
      const command = ctx.get(gfm.key).blockquote
      return command
    }),
    $command('hr', (ctx) => {
      const command = ctx.get(gfm.key).hr
      return command
    }),
    $command('link', (ctx) => {
      const command = ctx.get(gfm.key).link
      return command
    }),
  ]
}

/**
 * 注册自定义输入规则
 */
export function registerInputRules() {
  return [
    // 自动转换 => 标题
    $inputRule(
      (ctx) => {
        const rule = ctx.get(inputRules.key).textblockType
        return rule
      },
      {
        // 输入 # 或 ## 或 ### 自动转换为标题
        pattern: /^(#{1,6})\s$/,
        type: 'heading',
      },
    ),

    // 自动转换 - 或 * 或 + => 无序列表
    $inputRule(
      (ctx) => {
        const rule = ctx.get(inputRules.key).bulletList
        return rule
      },
      {
        pattern: /^[-*+]\s$/,
        type: 'bulletList',
      },
    ),

    // 自动转换 1. => 有序列表
    $inputRule(
      (ctx) => {
        const rule = ctx.get(inputRules.key).orderedList
        return rule
      },
      {
        pattern: /^\d+\.\s$/,
        type: 'orderedList',
      },
    ),

    // 自动转换 - [ ] => 任务列表
    $inputRule(
      (ctx) => {
        const rule = ctx.get(inputRules.key).taskList
        return rule
      },
      {
        pattern: /^-\s\[\s?\]\s$/,
        type: 'taskList',
      },
    ),

    // 自动转换 > => 引用
    $inputRule(
      (ctx) => {
        const rule = ctx.get(inputRules.key).blockquote
        return rule
      },
      {
        pattern: /^>\s$/,
        type: 'blockquote',
      },
    ),

    // 自动转换 --- => 分隔线
    $inputRule(
      (ctx) => {
        const rule = ctx.get(inputRules.key).hr
        return rule
      },
      {
        pattern: /^-{3,}$/,
        type: 'hr',
      },
    ),
  ]
}

/**
 * 获取所有插件配置
 */
export function getAllPlugins() {
  return {
    shortcuts: registerShortcuts(),
    inputRules: registerInputRules(),
  }
}

/**
 * 初始化插件管理器
 * @param {Object} ctx - Milkdown 上下文
 */
export function initPluginManager(ctx) {
  const { shortcuts, inputRules } = getAllPlugins()

  // 注册所有快捷键
  shortcuts.forEach((shortcut) => {
    ctx.set(shortcut.key, shortcut)
  })

  // 注册所有输入规则
  inputRules.forEach((rule) => {
    ctx.set(rule.key, rule)
  })

  return ctx
}
