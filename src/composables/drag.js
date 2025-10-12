import { ref } from 'vue'

export function useDragAndDrop(onDropCallback) {
  const isDragging = ref(false)
  let dropZone = null;

  // 初始化拖拽功能
  const initDragAndDrop = (element) => {
    dropZone = element;
    if (dropZone) {
      dropZone.addEventListener('dragenter', handleDragEnter);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('drop', handleDrop);
    }
  };

  // 清除事件监听
  const cleanup = () => {
    if (dropZone) {
      dropZone.removeEventListener('dragenter', handleDragEnter);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('drop', handleDrop);
      isDragging.value = false;
    }
  };
  
  // 处理拖拽进入事件
  const handleDragEnter = (e) => {
    e.preventDefault()
    isDragging.value = true
  }

  // 处理拖拽离开事件  
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      isDragging.value = false
    }
  }

  // 处理拖拽覆盖事件
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  // 处理文件释放事件
  const handleDrop = (e) => {
    e.preventDefault()
    isDragging.value = false
    
    const file = e.dataTransfer.files[0]
    if (!file) return

    // 通过回调处理文件
    if (typeof onDropCallback === 'function') {
      onDropCallback(file)
    }
  }

  return {
    isDragging,
    initDragAndDrop,
    cleanup,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  }
}
