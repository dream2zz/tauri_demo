<script setup>
import { ref, onMounted } from "vue";
import { listen } from "@tauri-apps/api/event";
import { usePanelStore } from "../stores/panelStore";

const props = defineProps({
  panelId: { type: String, required: true },
});

const store = usePanelStore();
const text = ref("");

onMounted(() => {
  // 监听从主窗口传来的状态
  listen("panel-transfer", (event) => {
    const { panelId, state } = event.payload;
    if (panelId === props.panelId && state) {
      text.value = state.text || "";
    }
  });

  // 初始化状态
  const state = store.getPanelState(props.panelId);
  text.value = state.text || "";
});

function updateText() {
  store.updatePanelState(props.panelId, { text: text.value });
}
</script>

<template>
  <div class="doc-page">
    <div class="doc-header">
      <h2>{{ panelId }}</h2>
    </div>
    <textarea
      v-model="text"
      @input="updateText"
      placeholder="在此输入内容..."
      class="text-input"
    />
  </div>
</template>

<style scoped>
.doc-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.doc-header {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.doc-header h2 {
  font-size: 14px;
  font-weight: normal;
  color: var(--text-primary);
}

.text-input {
  flex: 1;
  width: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: none;
  padding: 16px;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', monospace;
  resize: none;
  outline: none;
}

.text-input::placeholder {
  color: var(--text-secondary);
}
</style>
