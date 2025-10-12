/**
 * 主题管理组合式函数
 * 
 * 功能：
 * 1. 提供主题状态管理 (light/dark)
 * 2. 持久化主题设置到localStorage
 * 3. 提供主题切换方法
 * 4. 通过provide/inject实现跨组件共享
 * 
 * 使用方法：
 * 在根组件调用useTheme()，子组件通过inject('theme')获取
 */
import { ref, provide } from 'vue';

export function useTheme() {
    // 主题状态，优先从localStorage读取，默认light
    const theme = ref(localStorage.getItem('theme') || 'light');

    /**
     * 切换主题
     * @returns {void}
     */
    const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', theme.value);
    }

    // 向子组件提供主题上下文
    provide('theme', {
        theme,          // 当前主题状态
        toggleTheme     // 切换方法
    })

    return {
        theme,          // 当前主题状态(ref)
        toggleTheme     // 切换方法
    }
}
