<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import ProjectPanel from "./ProjectPanel.vue";
import CanvasPanel from "./panels/CanvasPanel.vue";
import TerminalPanel from "./panels/TerminalPanel.vue";
import PreviewPanel from "./tabs/PreviewPanel.vue";

// 四个固定面板配置
const panels = ref([
  { id: "left", title: "资源管理器", component: "project" },
  { id: "editor", title: "画笔", component: "canvas" },
  { id: "terminal", title: "终端", component: "terminal" },
  { id: "right", title: "预览", component: "preview" },
]);

// 已弹出的子窗口面板（在主窗口中隐藏对应区域）
const poppedPanels = ref(new Set());

// 拖拽状态
const dragState = ref({
  active: false,
  panelId: null,
  startX: 0,
  startY: 0,
  hasMoved: false,
});

// 鼠标按下
function onMouseDown(panelId, event) {
  if (event.button !== 0) return;
  dragState.value = {
    active: true,
    panelId,
    startX: event.clientX,
    startY: event.clientY,
    hasMoved: false,
  };
}

// 鼠标移动 - 检测拖拽距离
function onMouseMove(event) {
  if (!dragState.value.active) return;

  const dx = Math.abs(event.clientX - dragState.value.startX);
  const dy = Math.abs(event.clientY - dragState.value.startY);

  if (dx > 30 || dy > 30) {
    dragState.value.hasMoved = true;
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  }
}

// 鼠标释放 - 检测是否拖出窗口
function onMouseUp(event) {
  if (!dragState.value.active || !dragState.value.hasMoved) {
    resetDragState();
    return;
  }

  const cx = event.clientX;
  const cy = event.clientY;
  const w = window.innerWidth;
  const h = window.innerHeight;

  const outOfBounds = cx <= 0 || cx >= w || cy <= 0 || cy >= h;

  if (outOfBounds) {
    // 使用 screenX/screenY 获取屏幕绝对坐标（跨屏幕兼容）
    popOutPanel(dragState.value.panelId, event.screenX, event.screenY);
  }

  resetDragState();
}

function resetDragState() {
  dragState.value = { active: false, panelId: null, startX: 0, startY: 0, hasMoved: false };
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

// 通过 Rust 后端弹出子窗口
async function popOutPanel(panelId, mouseX, mouseY) {
  const panel = panels.value.find((p) => p.id === panelId);
  if (!panel) return;

  console.log("弹出面板为子窗口:", panel.title);

  try {
    // 构建子窗口 URL（使用 Tauri 的 App URL 格式）
    const url = `/?panel=${panel.component}&title=${encodeURIComponent(panel.title)}`;

    await invoke("create_child_window", {
      url: url,
      title: panel.title,
      panel: panel.component,
      x: mouseX,
      y: mouseY,
    });

    // 标记面板已弹出
    poppedPanels.value.add(panelId);
    console.log("子窗口创建成功");
  } catch (error) {
    console.error("创建子窗口失败:", error);
  }
}

// 双击占位区域 → 关闭所有子窗口并恢复面板
async function dockPanel() {
  try {
    await invoke("close_child_windows");
    poppedPanels.value.clear();
    console.log("所有面板已恢复");
  } catch (error) {
    console.error("关闭子窗口失败:", error);
  }
}

// ---- 子窗口拖拽停靠检测 ----
const childDragPanel = ref(null);    // 当前被拖拽的子窗口面板 component 名
const hoveredPlaceholder = ref(null); // 当前鼠标悬停的占位区域 panel id

// 检查屏幕坐标是否在某个占位区域内
function checkPlaceholderHit(screenX, screenY) {
  const placeholders = document.querySelectorAll(".dock-placeholder[data-panel]");
  for (const el of placeholders) {
    const rect = el.getBoundingClientRect();
    // 将 DOM 坐标转换为屏幕坐标
    const screenLeft = rect.left + window.screenX;
    const screenTop = rect.top + window.screenY;
    const screenRight = rect.right + window.screenX;
    const screenBottom = rect.bottom + window.screenY;

    if (
      screenX >= screenLeft &&
      screenX <= screenRight &&
      screenY >= screenTop &&
      screenY <= screenBottom
    ) {
      return el.getAttribute("data-panel");
    }
  }
  return null;
}

// 全局事件监听
let unlistenDock = null;
let unlistenChildDragMove = null;
let unlistenChildDragEnd = null;

onMounted(async () => {
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  // 监听子窗口发来的"停靠回来"事件（按钮点击方式）
  unlistenDock = await listen("dock-panel-back", (event) => {
    const { panel } = event.payload;
    const panelConfig = panels.value.find((p) => p.component === panel);
    if (panelConfig) {
      poppedPanels.value.delete(panelConfig.id);
      console.log("面板已停靠回来:", panelConfig.title);
    }
  });

  // 监听子窗口拖拽移动事件
  unlistenChildDragMove = await listen("child-drag-move", (event) => {
    const { panel, screenX, screenY } = event.payload;
    childDragPanel.value = panel;
    hoveredPlaceholder.value = checkPlaceholderHit(screenX, screenY);
  });

  // 监听子窗口拖拽结束事件
  unlistenChildDragEnd = await listen("child-drag-end", async (event) => {
    const { panel, screenX, screenY } = event.payload;
    const hitPanelId = checkPlaceholderHit(screenX, screenY);

    if (hitPanelId) {
      // 找到对应的面板配置
      const panelConfig = panels.value.find((p) => p.id === hitPanelId);
      if (panelConfig && panelConfig.component === panel) {
        // 停靠回来
        poppedPanels.value.delete(hitPanelId);
        // 关闭子窗口
        try {
          await invoke("close_child_window", { panel });
        } catch (err) {
          console.error("关闭子窗口失败:", err);
        }
        console.log("面板拖拽停靠回来:", panelConfig.title);
      }
    }

    // 重置状态
    childDragPanel.value = null;
    hoveredPlaceholder.value = null;
  });
});

onUnmounted(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  if (unlistenDock) unlistenDock();
  if (unlistenChildDragMove) unlistenChildDragMove();
  if (unlistenChildDragEnd) unlistenChildDragEnd();
});
</script>

<template>
  <div class="app-layout">
    <!-- 左侧面板 -->
    <div v-if="!poppedPanels.has('left')" class="panel left-panel">
      <div class="panel-header" @mousedown="onMouseDown('left', $event)">
        <span class="panel-title">资源管理器</span>
        <span class="drag-hint">← 拖出窗口</span>
      </div>
      <div class="panel-content">
        <ProjectPanel />
      </div>
    </div>
    <div
      v-else
      class="dock-placeholder left-placeholder"
      :class="{ highlight: hoveredPlaceholder === 'left' }"
      data-panel="left"
      @dblclick="dockPanel"
    >
      <span>资源管理器已弹出</span>
      <span class="dock-hint">拖拽标题栏到此停靠</span>
    </div>

    <!-- 中间区域 -->
    <div class="center-area">
      <div v-if="!poppedPanels.has('editor')" class="panel center-top-panel">
        <div class="panel-header" @mousedown="onMouseDown('editor', $event)">
          <span class="panel-title">画笔</span>
          <span class="drag-hint">← 拖出窗口</span>
        </div>
        <div class="panel-content">
          <CanvasPanel />
        </div>
      </div>
      <div
        v-else
        class="dock-placeholder center-top-placeholder"
        :class="{ highlight: hoveredPlaceholder === 'editor' }"
        data-panel="editor"
        @dblclick="dockPanel"
      >
        <span>画笔已弹出</span>
        <span class="dock-hint">拖拽标题栏到此停靠</span>
      </div>

      <div v-if="!poppedPanels.has('terminal')" class="panel center-bottom-panel">
        <div class="panel-header" @mousedown="onMouseDown('terminal', $event)">
          <span class="panel-title">终端</span>
          <span class="drag-hint">← 拖出窗口</span>
        </div>
        <div class="panel-content">
          <TerminalPanel />
        </div>
      </div>
      <div
        v-else
        class="dock-placeholder center-bottom-placeholder"
        :class="{ highlight: hoveredPlaceholder === 'terminal' }"
        data-panel="terminal"
        @dblclick="dockPanel"
      >
        <span>终端已弹出</span>
        <span class="dock-hint">拖拽标题栏到此停靠</span>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div v-if="!poppedPanels.has('right')" class="panel right-panel">
      <div class="panel-header" @mousedown="onMouseDown('right', $event)">
        <span class="panel-title">预览</span>
        <span class="drag-hint">← 拖出窗口</span>
      </div>
      <div class="panel-content">
        <PreviewPanel />
      </div>
    </div>
    <div
      v-else
      class="dock-placeholder right-placeholder"
      :class="{ highlight: hoveredPlaceholder === 'right' }"
      data-panel="right"
      @dblclick="dockPanel"
    >
      <span>预览已弹出</span>
      <span class="dock-hint">拖拽标题栏到此停靠</span>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  gap: 2px;
  background: var(--border-color);
}

.panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.left-panel {
  width: 240px;
  min-width: 180px;
  max-width: 400px;
}

.center-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.center-top-panel {
  flex: 1;
  min-height: 200px;
}

.center-bottom-panel {
  height: 250px;
  min-height: 100px;
}

.right-panel {
  width: 300px;
  min-width: 200px;
  max-width: 500px;
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
  transition: background 0.2s;
}

.panel-header:hover {
  background: var(--bg-hover);
}

.panel-header:active {
  cursor: grabbing;
}

.panel-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.drag-hint {
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity 0.2s;
}

.panel-header:hover .drag-hint {
  opacity: 0.7;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
}

/* 占位区域样式 */
.dock-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  border-radius: 4px;
  margin: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: var(--text-secondary);
}

.dock-placeholder:hover {
  border-color: var(--accent-color);
  background: rgba(0, 122, 204, 0.05);
  color: var(--accent-color);
}

.dock-placeholder.highlight {
  border-color: var(--accent-color);
  background: rgba(0, 122, 204, 0.15);
  color: var(--accent-color);
  box-shadow: 0 0 12px rgba(0, 122, 204, 0.3);
  transform: scale(1.02);
}

.dock-hint {
  font-size: 10px;
  opacity: 0.6;
}

.left-placeholder {
  width: 240px;
  min-width: 180px;
  max-width: 400px;
}

.center-top-placeholder {
  flex: 1;
  min-height: 200px;
}

.center-bottom-placeholder {
  height: 250px;
  min-height: 100px;
}

.right-placeholder {
  width: 300px;
  min-width: 200px;
  max-width: 500px;
}
</style>