<script setup>
import { ref, onMounted } from "vue";
import AppLayout from "./components/AppLayout.vue";
import ChildPanel from "./views/ChildPanel.vue";

// 判断是否为子窗口
const isChildWindow = ref(false);
const childPanel = ref("");
const childTitle = ref("");

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("panel")) {
    isChildWindow.value = true;
    childPanel.value = params.get("panel") || "";
    childTitle.value = decodeURIComponent(params.get("title") || "面板");
  }
});
</script>

<template>
  <!-- 子窗口：渲染 ChildPanel -->
  <ChildPanel
    v-if="isChildWindow"
    :panel="childPanel"
    :title="childTitle"
  />
  <!-- 主窗口：渲染完整界面 -->
  <AppLayout v-else />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f3f3;
  --bg-tertiary: #ececec;
  --bg-hover: #e0e0e0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #c0c0c0;
  --accent-color: #007acc;
  --accent-hover: #0098ff;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  color: var(--text-primary);
  background: var(--bg-primary);
}
</style>
