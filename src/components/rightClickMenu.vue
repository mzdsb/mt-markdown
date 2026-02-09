<!-- 弹出包含 加粗、斜体、链接、列表、引用、复选框、段落（1-6级标题）、插入（代码块、表格） 等功能的菜单 -->
 <template id="rightClickMenu">
    <div class="md-menu" :data-theme="injectedTheme" @click.stop :style="`left:${props.left}px;top:${props.top}px`">
         <!-- 文本格式组 -->
    <div class="menu-section">
      <h4 class="menu-section-title">文本格式</h4>
      <div class="menu-items">
        <button class="menu-item" @click="wrap('**')" title="加粗 (Ctrl+B)">
          <strong>B</strong>
        </button>
        <button class="menu-item" @click="wrap('*')" title="斜体 (Ctrl+I)">
          <em>I</em>
        </button>
        <button class="menu-item" @click="wrap('`')" title="代码">
          <code>`</code>
        </button>
        <button class="menu-item" @click="insertLink" title="链接 (Ctrl+K)">
          🔗
        </button>
      </div>
    </div>

    <!-- 段落格式组 -->
    <div class="menu-section">
      <h4 class="menu-section-title">段落格式</h4>
      <div class="menu-items">
        <button class="menu-item header-item" @click="insertHeader(1)">H1</button>
        <button class="menu-item header-item" @click="insertHeader(2)">H2</button>
        <button class="menu-item header-item" @click="insertHeader(3)">H3</button>
        <button class="menu-item header-item" @click="insertHeader(4)">H4</button>
        <button class="menu-item header-item" @click="insertHeader(5)">H5</button>
        <button class="menu-item header-item" @click="insertHeader(6)">H6</button>
        <button class="menu-item" @click="wrap('> ')" title="引用">
          "
        </button>
      </div>
    </div>

    <!-- 列表组 -->
    <div class="menu-section">
      <h4 class="menu-section-title">列表</h4>
      <div class="menu-items">
        <button class="menu-item" @click="insertList('unordered')" title="无序列表">
          •
        </button>
        <button class="menu-item" @click="insertList('ordered')" title="有序列表">
          1.
        </button>
        <button class="menu-item" @click="insertCheckbox(false)" title="未勾选">
          ☐
        </button>
        <button class="menu-item" @click="insertCheckbox(true)" title="已勾选">
          ☑
        </button>
      </div>
    </div>

    <!-- 插入组 -->
    <div class="menu-section">
      <h4 class="menu-section-title">插入</h4>
      <div class="menu-items">
        <button class="menu-item" @click="insertCodeBlock" title="代码块">
          <code>&lt;/&gt;</code>
        </button>
        <button class="menu-item" @click="insertTable" title="表格">
          📊
        </button>
        <button class="menu-item" @click="insertImage" title="图片">
          🖼️
        </button>
      </div>
    </div>
    </div>
 </template>

 <script setup >
    import { defineProps, defineEmits, inject } from 'vue';

// 定义Props
const props = defineProps([
  'left',
  'top',
  'selectionStart',
  'selectionEnd',
  'currentValue'
]);

// 定义事件
const emit = defineEmits(['update-content', 'close-menu']);

// 注入主题
const { theme: injectedTheme } = inject('theme');

// console.log(props);


/**
 * 通用方法：包裹/插入符号
 * @param {string} symbol 要包裹的符号（如**、*、`等）
 * @param {string} extra 额外后缀（如列表的空格）
 * @param {number} cursorOffset 光标偏移量调整
 */
const wrap = (symbol, extra = '', cursorOffset = 0) => {
  const { selectionStart, selectionEnd, currentValue } = props;
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  
  let newText = '';
  let cursorPos = selectionStart; // 光标位置

  if (selectedText) {
    // 1. 选中文本 → 包裹符号
    newText = [
      currentValue.slice(0, selectionStart),
      symbol,
      selectedText,
      symbol + extra,
      currentValue.slice(selectionEnd)
    ].join('');
    cursorPos = selectionEnd + symbol.length + extra.length + cursorOffset;
  } else {
    // 2. 无选中文本 → 插入符号，光标居中
    newText = [
      currentValue.slice(0, selectionStart),
      symbol,
      extra ? ' ' : '', // 额外空格（如列表的"- "）
      symbol + extra,
      currentValue.slice(selectionEnd)
    ].join('');
    cursorPos = selectionStart + symbol.length + (extra ? 1 : 0) + cursorOffset;
  }

  emit('update-content', newText, cursorPos);
};


/**
 * 插入链接：[文本](链接)
 */
const insertLink = () => {
  const { selectionStart, selectionEnd, currentValue } = props;
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  const defaultText = selectedText || '链接文本';
  const defaultUrl = 'https://example.com';

  const newText = [
    currentValue.slice(0, selectionStart),
    `[${defaultText}](${defaultUrl})`,
    currentValue.slice(selectionEnd)
  ].join('');

  // 光标定位到链接中间（方便修改URL）
  const cursorPos = selectionStart + defaultText.length + 3; // [描述](|) → 光标在括号内
  emit('update-content', newText, cursorPos);
};


/**
 * 插入图片：![alt](url)
 */
const insertImage = () => {
  const { selectionStart, selectionEnd, currentValue } = props;
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  const defaultAlt = selectedText || '图片描述';
  const defaultUrl = 'https://example.com/image.jpg';

  const newText = [
    currentValue.slice(0, selectionStart),
    `![${defaultAlt}](${defaultUrl})`,
    currentValue.slice(selectionEnd)
  ].join('');

  // 光标定位到URL中间
  const cursorPos = selectionStart + defaultAlt.length + 4; // ![描述](|) → 光标在括号内
  emit('update-content', newText, cursorPos);
};


/**
 * 插入列表（有序/无序）
 */
const insertList = (type) => {
  const { selectionStart, selectionEnd, currentValue } = props;
  const lines = currentValue.slice(selectionStart, selectionEnd).split('\n');
  
  // 生成带前缀的行（有序列表自动编号）
  const prefixedLines = lines.map((line, index) => {
    const prefix = type === 'ordered' 
      ? `${index + 1}. ` 
      : '- ';
    return `${prefix}${line}`;
  }).join('\n');

  const newText = [
    currentValue.slice(0, selectionStart),
    prefixedLines,
    currentValue.slice(selectionEnd)
  ].join('');

  emit('update-content', newText);
};


/**
 * 插入复选框（- [ ] 或 - [x]）
 */
const insertCheckbox = (checked) => {
  const prefix = checked ? '- [x] ' : '- [ ] ';
  const { selectionStart, selectionEnd, currentValue } = props;
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  
  // 检查是否需要添加前导换行
  const needsLeadingNewline = selectionStart > 0 && currentValue[selectionStart - 1] !== '\n';
  const leadingNewline = needsLeadingNewline ? '\n' : '';
  
  const newText = [
    currentValue.slice(0, selectionStart),
    leadingNewline,
    prefix,
    selectedText,
    currentValue.slice(selectionEnd)
  ].join('');
  
  // 计算光标位置
  const cursorPos = selectionStart + leadingNewline.length + prefix.length + selectedText.length;
  
  emit('update-content', newText, cursorPos);
};


/**
 * 插入标题（1-6级）
 */
const insertHeader = (level) => {
  if (level < 1 || level > 6) return;
  
  const headerSymbol = '#'.repeat(level) + ' ';
  
  // 检查当前位置是否在行首
  const { selectionStart, currentValue } = props;
  let adjustedStart = selectionStart;
  
  // 如果不在行首，添加换行
  if (selectionStart > 0 && currentValue[selectionStart - 1] !== '\n') {
    const newTextBefore = currentValue.slice(0, selectionStart) + '\n';
    adjustedStart = selectionStart + 1;
    const newText = newTextBefore + currentValue.slice(selectionStart);
    
    // 更新文本并插入标题符号
    const finalText = [
      newText.slice(0, adjustedStart),
      headerSymbol,
      newText.slice(adjustedStart)
    ].join('');
    
    emit('update-content', finalText, adjustedStart + headerSymbol.length);
  } else {
    // 直接在行首插入标题符号
    const newText = [
      currentValue.slice(0, selectionStart),
      headerSymbol,
      currentValue.slice(selectionStart)
    ].join('');
    
    emit('update-content', newText, selectionStart + headerSymbol.length);
  }
};


/**
 * 插入代码块
 */
const insertCodeBlock = () => {
  const { selectionStart, selectionEnd, currentValue } = props;
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  const language = 'javascript'; // 默认语言
  
  // 检查是否需要添加前导换行
  const needsLeadingNewline = selectionStart > 0 && currentValue[selectionStart - 1] !== '\n';
  const leadingNewline = needsLeadingNewline ? '\n' : '';
  
  // 检查是否需要添加尾随换行
  const needsTrailingNewline = selectionEnd < currentValue.length && currentValue[selectionEnd] !== '\n';
  const trailingNewline = needsTrailingNewline ? '\n' : '';
  
  const newText = [
    currentValue.slice(0, selectionStart),
    leadingNewline,
    '```' + language + '\n',
    selectedText || '', // 如果有选中内容则放入代码块
    selectedText ? '\n' : '',
    '```',
    trailingNewline,
    currentValue.slice(selectionEnd)
  ].join('');
  
  // 计算光标位置
  let cursorPos;
  if (selectedText) {
    // 如果有选中内容，光标放在代码块末尾
    cursorPos = selectionStart + leadingNewline.length + 
                (`\`\`\`${language}\n`).length + 
                selectedText.length + 1; // +1 是为了跳过换行
  } else {
    // 如果没有选中内容，光标放在代码块中间
    cursorPos = selectionStart + leadingNewline.length + 
                (`\`\`\`${language}\n`).length;
  }
  
  emit('update-content', newText, cursorPos);
};


/**
 * 插入表格
 */
const insertTable = () => {
  const { selectionStart, currentValue } = props;
  
  // 表格模板
  const tableTemplate = `| 表头1 | 表头2 | 表头3 |
| --- | --- | --- |
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |`;
  
  // 检查是否需要添加前后换行
  const needsLeadingNewline = selectionStart > 0 && currentValue[selectionStart - 1] !== '\n';
  const leadingNewline = needsLeadingNewline ? '\n' : '';
  const trailingNewline = '\n';
  
  const newText = [
    currentValue.slice(0, selectionStart),
    leadingNewline,
    tableTemplate,
    trailingNewline,
    currentValue.slice(selectionStart)
  ].join('');
  
  // 光标定位到第一个单元格
  const cursorPos = selectionStart + leadingNewline.length + '| '.length;
  
  emit('update-content', newText, cursorPos);
};
</script>

<style scoped>
.md-menu {
  position: fixed;
  background: var(--menu-bg);
  border: 1px solid var(--menu-border);
  border-radius: 6px;
  box-shadow: var(--menu-shadow);
  padding: 8px 0;
  z-index: 9999;
  min-width: 280px;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.menu-section {
  padding: 4px 8px;
  border-bottom: 1px solid var(--menu-section-border);
  transition: border-color 0.3s ease;
}

.menu-section:last-child {
  border-bottom: none;
}

.menu-section-title {
  margin: 0 0 6px 0;
  font-size: 12px;
  color: var(--menu-title-color);
  font-weight: 600;
  padding: 0 4px;
  transition: color 0.3s ease;
}

.menu-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.menu-item {
  padding: 6px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 14px;
  transition: background 0.2s, color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  color: var(--menu-item-color);
}

.menu-item:hover {
  background: var(--menu-item-hover-bg);
}

.menu-item.header-item {
  background-color: var(--menu-header-bg);
  font-weight: bold;
  transition: background-color 0.2s, color 0.3s ease;
  color: var(--menu-item-color);
}

.menu-item.header-item:hover {
  background-color: var(--menu-header-hover-bg);
}

.menu-item code {
  font-family: monospace;
  background-color: var(--menu-item-hover-bg);
  padding: 0 3px;
  border-radius: 2px;
}
</style>
