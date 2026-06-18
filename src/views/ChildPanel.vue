<script setup>
import { computed, ref, onUnmounted } from "vue";
import { emit } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import ProjectPanel from "../components/ProjectPanel.vue";
import CanvasPanel from "../components/panels/CanvasPanel.vue";
import TerminalPanel from "../components/panels/TerminalPanel.vue";
import PreviewPanel from "../components/tabs/PreviewPanel.vue";

const props = defineProps({
  panel: { type: String, required: true },
  title: { type: String, default: "面板" },
});

const componentMap = {
  project: ProjectPanel,
  canvas: CanvasPanel,
  terminal: TerminalPanel,
  preview: PreviewPanel,
};

const currentComponent = computed(() => componentMap[props.panel] || null);

// ---- 标题栏拖拽停靠逻辑 ----
const isDragging = ref(false);
const dragStartPos = ref({ x: 0, y: 0 });

function onHeaderMouseDown(e) {
  if (e.button !== 0) return;
  isDragging.value = true;
  dragStartPos.value = { x: e.clientX, y: e.clientY };
  document.addEventListener("mousemove", onHeaderMouseMove);
  document.addEventListener("mouseup", onHeaderMouseUp);
}

function onHeaderMouseMove(e) {
  if (!isDragging.value) return;
  const dx = Math.abs(e.clientX - dragStartPos.value.x);
  const dy = Math.abs(e.clientY - dragStartPos.value.y);
  if (dx > 5 || dy > 5) {
    emit("child-drag-move", {
      panel: props.panel,
      screenX: e.screenX,
      screenY: e.screenY,
    });
  }
}

function onHeaderMouseUp(e) {
  document.removeEventListener("mousemove", onHeaderMouseMove);
  document.removeEventListener("mouseup", onHeaderMouseUp);
  if (!isDragging.value) return;

  const dx = Math.abs(e.clientX - dragStartPos.value.x);
  const dy = Math.abs(e.clientY - dragStartPos.value.y);
  if (dx > 5 || dy > 5) {
    // 拖拽结束，通知主窗口
    emit("child-drag-end", {
      panel: props.panel,
      screenX: e.screenX,
      screenY: e.screenY,
    });
  }
  isDragging.value = false;
}

// ---- 原生标题栏拖拽停靠逻辑 ----
// 监听 Tauri 窗口 moved 事件，检测是否拖到主窗口占位区域
let unlistenMoved = null;
let moveEndTimer = null;
let lastMovedPos = { x: 0, y: 0 };

async function setupNativeDragDock() {
  const win = getCurrentWindow();

  unlistenMoved = await win.onMoved((event) => {
    const { x, y } = event.payload;
    lastMovedPos = { x, y };

    // 通知主窗口：子窗口正在移动（用于高亮占位区域）
    emit("child-drag-move", {
      panel: props.panel,
      screenX: x,
      screenY: y,
    });

    // 防抖：每次 moved 重置计时器。200ms 内无新 moved → 鼠标已松开
    if (moveEndTimer) clearTimeout(moveEndTimer);
    moveEndTimer = setTimeout(() => {
      emit("child-drag-end", {
        panel: props.panel,
        screenX: lastMovedPos.x,
        screenY: lastMovedPos.y,
      });
    }, 200);
  });
}

setupNativeDragDock();

onUnmounted(() => {
  document.removeEventListener("mousemove", onHeaderMouseMove);
  document.removeEventListener("mouseup", onHeaderMouseUp);
  if (unlistenMoved) unlistenMoved();
  if (moveEndTimer) clearTimeout(moveEndTimer);
});

// 停靠回来：发送事件给主窗口，然后关闭自己
async function dockBack() {
  try {
    await emit("dock-panel-back", { panel: props.panel });
    const win = getCurrentWindow();
    await win.close();
  } catch (error) {
    console.error("停靠失败:", error);
  }
}
</script>

<template>
  <div class="child-panel">
    <div
      class="panel-header"
      :class="{ dragging: isDragging }"
      @mousedown="onHeaderMouseDown"
    >
      <span class="panel-title">{{ title }}</span>
      <button class="dock-btn" @click.stop="dockBack" title="停靠回主窗口">
        ⬅ 停靠回来
      </button>
    </div>
    <div class="panel-content">
      <component :is="currentComponent" v-if="currentComponent" />
      <div v-else class="placeholder">
        <p>未知的面板类型: {{ panel }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.child-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  cursor: grab;
  user-select: none;
}

.panel-header.dragging {
  cursor: grabbing;
  background: var(--bg-hover);
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.dock-btn {
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--accent-color);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.dock-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}
</style>