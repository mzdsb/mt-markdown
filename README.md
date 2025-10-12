# MT Markdown 编辑器

一个基于 Vue 3 和 Vite 构建的 Markdown 编辑器组件，提供实时预览、主题切换、智能列表检测和右键菜单等功能。

## 🚀 功能特点

### 核心功能
- **实时 Markdown 预览** - 即时渲染Markdown内容
- **亮色/暗色主题切换** - 支持自定义主题系统
- **智能列表检测** - 自动识别并继续列表格式
- **右键菜单** - 丰富的文本格式化选项
- **拖拽文件上传** - 支持文件拖拽导入
- **代码语法高亮** - 支持多种编程语言

### 编辑功能
- **文本格式化**：粗体、斜体、代码块、链接
- **段落格式**：标题1-6、引用块
- **列表支持**：有序列表、无序列表、复选框列表
- **插入功能**：表格、图片、代码块
- **快捷键支持** - 常用编辑操作快捷键

### 技术特性
- **安全的 HTML 渲染** - 使用DOMPurify进行XSS防护
- **可扩展的 Markdown 解析** - 基于marked.js
- **自动语言检测** - 智能识别代码语言
- **错误处理机制** - 完善的错误处理

## 📁 项目结构

```
mt-markdown/
├── src/                        # 源代码目录
│   ├── components/             # Vue组件
│   │   ├── MTMarkdown.vue      # 主编辑器组件
│   │   ├── rightClickMenu.vue  # 右键菜单组件
│   │   └── StatusBar.vue       # 状态栏组件
│   ├── composables/            # 组合式函数
│   │   ├── useMarkdown.js      # Markdown转换逻辑
│   │   ├── useFileHandler.js   # 文件读写处理
│   │   ├── useShortcuts.js     # 键盘快捷键处理
│   │   ├── drag.js             # 拖拽功能
│   │   └── theme.js            # 主题管理
│   ├── assets/                 # 静态资源
│   │   ├── styles/             # 样式文件
│   │   │   └── MTMarkdown.css  # 主样式文件
│   │   ├── themes/             # 主题样式
│   │   │   ├── light.css       # 亮色主题
│   │   │   └── dark.css        # 暗色主题
│   │   └── icons/              # SVG图标
├── docs/                       # 文档
│   ├── example.js              # 使用示例
│   └── api.md                  # API文档
└── README.md                   # 项目说明
```

## 🛠️ 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 访问应用
在浏览器中访问 `http://localhost:5173`

## 💡 使用方法

### 在Vue项目中导入组件
```javascript
import MTMarkdown from './components/MTMarkdown.vue'
```

### 在模板中使用
```html
<MTMarkdown v-model="markdownContent" />
```

## ✨ 智能功能

### 智能列表检测
- **复选框列表**：自动继续 `- [ ]` 或 `- [x]` 格式
- **有序列表**：自动递增编号 `1. ` → `2. `
- **无序列表**：自动继续 `- `、`* ` 或 `+ ` 格式

### 右键菜单功能
- **文本格式**：加粗、斜体、代码、链接
- **段落格式**：标题1-6、引用块
- **列表功能**：有序/无序列表、复选框
- **插入功能**：代码块、表格、图片

## 🐛 已知问题

### 已修复问题 ✅
- 代码高亮功能不显示
- 拖拽上传功能无效
- 斜体功能无效
- 表格渲染问题
- 复选框重复插入问题

### 待解决问题 ⚠️
- 表格边框显示问题（正在修复中）

## 📝 开发文档

- [Bug修复记录](./bug_fix.md) - 详细的bug修复历史
- [功能测试用例](./test_markdown_fix.md) - Markdown功能测试
- [右键菜单说明](./menu记录.md) - 右键菜单功能文档
- [后续开发计划](./后续计划.md) - 项目发展规划

## 🎯 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **Markdown解析**：marked.js
- **代码高亮**：highlight.js
- **安全过滤**：DOMPurify
- **样式系统**：CSS变量 + 主题切换

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目！

## 📄 许可证

MIT License
