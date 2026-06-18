<script setup>
import { ref } from "vue";
import { usePanelStore } from "../stores/panelStore";
import DraggableTab from "./DraggableTab.vue";

const store = usePanelStore();

const docLabels = {
  doc1: "文档 1",
  doc2: "文档 2",
  doc3: "文档 3",
  doc4: "文档 4",
};

const activeDoc = ref("doc1");

function setActiveDoc(docId) {
  activeDoc.value = docId;
}

function addDoc() {
  const existing = store.openPanels.filter((p) => /^doc\d+$/.test(p));
  const nextNum = existing.length + 1;
  if (nextNum <= 4) {
    store.addPanel(`doc${nextNum}`);
    activeDoc.value = `doc${nextNum}`;
  }
}
</script>

<template>
  <div class="editor-area">
    <!-- 标签栏 -->
    <div class="tabs-bar">
      <DraggableTab
        v-for="panelId in store.openPanels.filter((p) => /^doc\d+$/.test(p))"
        :key="panelId"
        :panel-id="panelId"
        :label="docLabels[panelId] || panelId"
        :active="activeDoc === panelId"
        @activate="setActiveDoc(panelId)"
      />
      <div class="add-tab" @click="addDoc" title="新建文档">+</div>
    </div>

    <!-- 内容区域 -->
    <div class="editor-content">
      <div v-if="activeDoc" class="doc-editor">
        <textarea
          :value="store.getPanelState(activeDoc).text || ''"
          @input="(e) => store.updatePanelState(activeDoc, { text: e.target.value })"
          placeholder="在此输入内容..."
          class="text-input"
        />
      </div>
      <div v-else class="empty-state">
        <p>打开一个文档开始编辑</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.tabs-bar {
  display: flex;
  align-items: center;
  height: 35px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.add-tab {
  width: 30px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 18px;
}

.add-tab:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

.doc-editor {
  height: 100%;
}

.text-input {
  width: 100%;
  height: 100%;
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

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}
</style>
