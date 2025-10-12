<!-- src/App.vue -->
<script setup>
import { ref } from 'vue'
import MTMarkdown from './components/MTMarkdown.vue'
import StatusBar from './components/StatusBar.vue'
import { useTheme } from './composables/theme'

// 初始化主题 - 直接调用确保provide生效
useTheme()
const content = ref('')
</script>

<template>
  <div class="app-container">
    <MTMarkdown v-model="content"/>
    <StatusBar :content="content"/>
  </div>
</template>

<style>
.app-container {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  /* overflow: hidden; */

}
</style>
