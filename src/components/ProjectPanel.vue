<script setup>
import { ref } from "vue";
import TreeNode from "./TreeNode.vue";

const treeData = ref([
  {
    name: "src",
    type: "folder",
    expanded: true,
    children: [
      {
        name: "components",
        type: "folder",
        expanded: true,
        children: [
          { name: "ActivityBar.vue", type: "file" },
          { name: "AppLayout.vue", type: "file" },
          { name: "BottomPanel.vue", type: "file" },
          { name: "EditorArea.vue", type: "file" },
          { name: "ProjectPanel.vue", type: "file" },
          { name: "RightPanel.vue", type: "file" },
          { name: "TreeNode.vue", type: "file" },
        ],
      },
      {
        name: "stores",
        type: "folder",
        expanded: false,
        children: [{ name: "panelStore.js", type: "file" }],
      },
      {
        name: "utils",
        type: "folder",
        expanded: false,
        children: [
          { name: "panelParser.js", type: "file" },
          { name: "windowManager.js", type: "file" },
        ],
      },
      { name: "App.vue", type: "file" },
      { name: "main.js", type: "file" },
    ],
  },
  { name: "package.json", type: "file" },
  { name: "vite.config.js", type: "file" },
]);
</script>

<template>
  <div class="project-panel">
    <div class="panel-header">资源管理器</div>
    <div class="tree-container">
      <TreeNode v-for="node in treeData" :key="node.name" :node="node" />
    </div>
  </div>
</template>

<style scoped>
.project-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 8px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}
</style>
