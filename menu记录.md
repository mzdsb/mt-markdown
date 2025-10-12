# Markdown编辑器右键菜单功能说明

## 功能实现

### 1. 右键菜单触发机制
- 在`MTMarkdown.vue`中监听textarea的`@contextmenu`事件
- 事件处理函数`rightClick`记录：
  - 鼠标位置（用于菜单定位）
  - 文本选区位置（selectionStart/selectionEnd）
- 显示`RightClickMenu`组件并传递相关props

```javascript
// MTMarkdown.vue中的关键代码
function rightClick(e) {
  selectionStart.value = textareaRef.value.selectionStart;
  selectionEnd.value = textareaRef.value.selectionEnd;
  menuLeft.value = e.clientX;
  menuTop.value = e.clientY;
  isMenuShow.value = true;
}
```

### 2. 右键菜单功能实现
- 菜单分为4个功能组：
  1. 文本格式（加粗、斜体、代码、链接）
  2. 段落格式（标题1-6、引用）
  3. 列表（有序/无序列表、复选框）
  4. 插入（代码块、表格、图片）

- 核心方法`wrap`处理文本包裹逻辑：
```javascript
const wrap = (symbol, extra = '', cursorOffset = 0) => {
  // 处理选中文本或插入新文本
  if (selectedText) {
    // 包裹选中文本
    newText = /* 拼接文本 */;
  } else {
    // 插入新文本
    newText = /* 拼接文本 */;
  }
  emit('update-content', newText, cursorPos);
};
```

### 3. 内容更新机制
- 通过`update-content`事件将修改后的内容传回父组件
- 父组件更新textarea内容并重新定位光标

```javascript
// MTMarkdown.vue中的更新处理
function updateContent(newValue, cursorPos){
  content.value = newValue;
  nextTick(() => {
    textareaRef.value.selectionStart = cursorPos;
    textareaRef.value.selectionEnd = cursorPos;
  });
}
```

## 功能状态更新

### ✅ 已修复的功能
1. **复选框功能** - 已完全修复
   - 修复了重复插入问题
   - 实现了智能列表检测
   - 支持自动序号递增

2. **斜体功能** - 已修复
   - 使用正确的Markdown语法
   - 支持单星号和下划线两种格式

3. **表格功能** - 部分修复
   - 表格插入功能正常
   - 表格边框显示问题待修复

### ⚠️ 待修复的问题
1. **表格边框显示问题**
   - 现象：表格边框在某些情况下显示异常
   - 状态：暂停修复，优先处理文档整理

## 当前功能状态
- ✅ 文本格式：粗体、斜体、代码、链接
- ✅ 段落格式：标题1-6、引用
- ✅ 列表：有序/无序列表、复选框（含智能检测）
- ✅ 插入：代码块、图片
- ⚠️ 表格：插入功能正常，边框显示待修复
