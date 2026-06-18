<script setup>
import { usePanelStore } from "../stores/panelStore";
import PropertiesTab from "./tabs/PropertiesTab.vue";
import ChatTab from "./tabs/ChatTab.vue";
import SettingsTab from "./tabs/SettingsTab.vue";
import HelpTab from "./tabs/HelpTab.vue";

const store = usePanelStore();

const tabs = [
  { id: "properties", label: "属性", icon: "🔧" },
  { id: "chat", label: "聊天", icon: "💬" },
  { id: "settings", label: "设置", icon: "⚙️" },
  { id: "help", label: "帮助", icon: "❓" },
];
</script>

<template>
  <div class="right-panel">
    <!-- 内容区域 -->
    <div class="panel-content">
      <PropertiesTab v-if="store.rightTab === 'properties'" />
      <ChatTab v-else-if="store.rightTab === 'chat'" />
      <SettingsTab v-else-if="store.rightTab === 'settings'" />
      <HelpTab v-else-if="store.rightTab === 'help'" />
    </div>

    <!-- 底部 Tab 栏 -->
    <div class="tabs-bar">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: store.rightTab === tab.id }"
        @click="store.rightTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  padding: 12px;
}

.tabs-bar {
  display: flex;
  height: 35px;
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  color: var(--text-secondary);
  border-top: 2px solid transparent;
}

.tab-item:hover {
  background: var(--bg-hover);
}

.tab-item.active {
  color: var(--text-primary);
  border-top-color: var(--accent-color);
}

.tab-icon {
  font-size: 14px;
  margin-bottom: 2px;
}
</style>
