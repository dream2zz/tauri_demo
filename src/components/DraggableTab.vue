<script setup>
import { ref, onUnmounted } from "vue";
import { usePanelStore } from "../stores/panelStore";

const props = defineProps({
  panelId: { type: String, required: true },
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
});

const emit = defineEmits(["activate"]);
const store = usePanelStore();

const isDragging = ref(false);
const dragStartPos = ref({ x: 0, y: 0 });
const hasMoved = ref(false);

function onMouseDown(e) {
  // 右键或已拖拽中不处理
  if (e.button !== 0) return;

  isDragging.value = true;
  hasMoved.value = false;
  dragStartPos.value = { x: e.clientX, y: e.clientY };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
  if (!isDragging.value) return;

  const dx = Math.abs(e.clientX - dragStartPos.value.x);
  const dy = Math.abs(e.clientY - dragStartPos.value.y);

  // 移动超过 5px 算开始拖拽
  if (dx > 5 || dy > 5) {
    hasMoved.value = true;
  }
}

function onMouseUp(e) {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);

  if (!isDragging.value) return;

  const dx = Math.abs(e.clientX - dragStartPos.value.x);
  const dy = Math.abs(e.clientY - dragStartPos.value.y);

  // 拖出窗口距离阈值
  if (dx > 50 || dy > 50) {
    // 拖出窗口，触发事件
    console.log("拖出面板:", props.panelId);
    store.triggerDragOut(props.panelId);
  } else if (!hasMoved.value) {
    // 没有移动，视为点击
    emit("activate");
  }

  isDragging.value = false;
  hasMoved.value = false;
}

function closeTab(e) {
  e.stopPropagation();
  console.log("关闭面板:", props.panelId);
  store.triggerDragOut(props.panelId);
}

onUnmounted(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
});
</script>

<template>
  <div
    class="draggable-tab"
    :class="{ active, dragging: isDragging && hasMoved }"
    @mousedown="onMouseDown"
  >
    <span class="tab-label">{{ label }}</span>
    <span class="tab-close" @click="closeTab">×</span>
  </div>
</template>

<style scoped>
.draggable-tab {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-color);
  cursor: grab;
  user-select: none;
  min-width: 80px;
  max-width: 150px;
  transition: background 0.15s;
}

.draggable-tab:hover {
  background: var(--bg-hover);
}

.draggable-tab.active {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--accent-color);
}

.draggable-tab.dragging {
  opacity: 0.7;
  cursor: grabbing;
  background: var(--bg-hover);
}

.tab-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.tab-close {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.15s;
}

.draggable-tab:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
