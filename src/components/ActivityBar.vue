<script setup>
import { usePanelStore } from "../stores/panelStore";

const store = usePanelStore();
const emit = defineEmits(["toggle"]);

const icons = [
  { id: "project", icon: "📁", title: "资源管理器" },
  { id: "search", icon: "🔍", title: "搜索" },
  { id: "git", icon: "🔀", title: "源代码管理" },
  { id: "settings", icon: "⚙️", title: "设置" },
];

function togglePanel(panelId) {
  emit("toggle", panelId);
}
</script>

<template>
  <div class="activity-bar">
    <div
      v-for="icon in icons"
      :key="icon.id"
      class="activity-icon"
      :class="{ active: store.openPanels.includes(icon.id) }"
      :title="icon.title"
      @click="togglePanel(icon.id)"
    >
      {{ icon.icon }}
    </div>
  </div>
</template>

<style scoped>
.activity-bar {
  width: 48px;
  min-width: 48px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
}

.activity-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  border-left: 2px solid transparent;
}

.activity-icon:hover {
  opacity: 1;
}

.activity-icon.active {
  opacity: 1;
  border-left-color: var(--accent-color);
}
</style>
