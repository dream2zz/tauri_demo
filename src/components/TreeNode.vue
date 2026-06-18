<script setup>
import { ref } from "vue";

const props = defineProps({
  node: { type: Object, required: true },
  level: { type: Number, default: 0 },
});

const expanded = ref(props.node.expanded || false);
const selected = ref(false);

function toggle() {
  if (props.node.type === "folder") {
    expanded.value = !expanded.value;
  } else {
    selected.value = !selected.value;
  }
}
</script>

<template>
  <div class="tree-node">
    <div
      class="node-item"
      :class="{ selected }"
      :style="{ paddingLeft: `${12 + level * 16}px` }"
      @click="toggle"
    >
      <span v-if="node.type === 'folder'" class="arrow" :class="{ expanded }">
        ▶
      </span>
      <span v-else class="arrow-space"></span>
      <span class="icon">{{ node.type === "folder" ? "📁" : "📄" }}</span>
      <span class="name">{{ node.name }}</span>
    </div>
    <div v-if="node.type === 'folder' && expanded" class="children">
      <TreeNode
        v-for="child in node.children"
        :key="child.name"
        :node="child"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<style scoped>
.node-item {
  display: flex;
  align-items: center;
  height: 22px;
  cursor: pointer;
  user-select: none;
}

.node-item:hover {
  background: var(--bg-hover);
}

.node-item.selected {
  background: var(--accent-color);
}

.arrow {
  width: 16px;
  font-size: 8px;
  color: var(--text-secondary);
  transition: transform 0.15s;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.arrow-space {
  width: 16px;
}

.icon {
  width: 16px;
  font-size: 14px;
  margin-right: 4px;
}

.name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
