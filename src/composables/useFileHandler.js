import { saveAs } from "file-saver";
import { ref, watch } from "vue";
import { useFileDialog } from '@vueuse/core'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['text/markdown', 'text/plain']

export function useFileHandler() {
    const fileContent = ref('');
    const errorMessage = ref('');

    // 处理文件读取
    const handleFile = (file) => {
        if (!file) return false;

        // 文件类型校验
        const isValidType = ALLOWED_TYPES.includes(file.type) || file.name.endsWith('.md');
        if (!isValidType) {
            errorMessage.value = '仅支持Markdown文件';
            return false;
        }

        // 文件大小校验
        if (file.size > MAX_FILE_SIZE) {
            errorMessage.value = '文件大小不能超过10MB';
            return false;
        }

        // 读取文件内容
        const reader = new FileReader();
        reader.onload = (e) => {
            fileContent.value = e.target.result;
        };
        reader.onerror = (e) => {
            console.error('读取文件失败', e);
            errorMessage.value = '读取文件失败';
        };
        reader.readAsText(file, 'UTF-8');
        return true;
    }

    // 导出文件
    const exportFile = (content, filename = `mt_${Date.now()}.md`) => {
        try {
            const blob = new Blob([content], {
                type: 'text/markdown; charset=utf-8'
            })
            saveAs(blob, filename)
        } catch (e) {
            console.error('导出失败', e);
            errorMessage.value = '导出失败';
        }
    }

    // 文件对话框导入
    const { files, open: openFileDialog } = useFileDialog({
        accept: '.md',
        multiple: false,
        reset: true
    });

    // 监听文件选择变化
    watch(files, (newFiles) => {
        if (!newFiles) { // 处理取消选择的情况
            errorMessage.value = '';
            return;
        }
        handleFile(newFiles[0]);
    });

    return {
        fileContent,
        errorMessage,
        openFileDialog,
        exportFile,
        handleFile // 暴露处理文件的方法供拖拽使用
    }
}
