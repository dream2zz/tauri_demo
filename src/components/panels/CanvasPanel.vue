<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { emit } from "@tauri-apps/api/event";
import { usePanelStore } from "../../stores/panelStore";

const props = defineProps({
  panelId: { type: String, default: "canvas" },
});

const store = usePanelStore();
const canvasRef = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);
const currentTool = ref("brush");
const brushSize = ref(5);
const brushColor = ref("#000000");
const lastX = ref(0);
const lastY = ref(0);

// 画布状态
const canvasState = ref({
  width: 800,
  height: 600,
  tool: "brush",
  size: 5,
  color: "#000000",
});

// 初始化画布
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  ctx.value = canvas.getContext("2d");
  canvas.width = canvasState.value.width;
  canvas.height = canvasState.value.height;
  
  // 设置白色背景
  ctx.value.fillStyle = "#ffffff";
  ctx.value.fillRect(0, 0, canvas.width, canvas.height);
  
  // 设置画笔样式
  ctx.value.lineCap = "round";
  ctx.value.lineJoin = "round";
  
  // 从 store 恢复画布内容
  restoreCanvasFromStore();
});

// 从 localStorage 恢复画布内容（跨窗口读取最新数据）
function restoreCanvasFromStore() {
  // 直接从 localStorage 读取，确保拿到子窗口写入的最新数据
  let dataUrl = "";
  try {
    const states = JSON.parse(localStorage.getItem("panelStates") || "{}");
    if (states.canvas && states.canvas.dataUrl) {
      dataUrl = states.canvas.dataUrl;
    }
  } catch (e) {
    // fallback 到 store
    const saved = store.getPanelState("canvas");
    if (saved) dataUrl = saved.dataUrl || "";
  }

  if (dataUrl) {
    const img = new Image();
    img.onload = () => {
      if (ctx.value && canvasRef.value) {
        ctx.value.drawImage(img, 0, 0);
      }
    };
    img.src = dataUrl;
  }
}

// 监听画笔属性变化
watch([brushSize, brushColor, currentTool], () => {
  canvasState.value.size = brushSize.value;
  canvasState.value.color = brushColor.value;
  canvasState.value.tool = currentTool.value;
  
  // 更新画笔样式
  if (ctx.value) {
    ctx.value.lineWidth = brushSize.value;
    ctx.value.strokeStyle = brushColor.value;
    
    if (currentTool.value === "eraser") {
      ctx.value.strokeStyle = "#ffffff";
    }
  }
});

// 开始绘画
function startDrawing(e) {
  isDrawing.value = true;
  const rect = canvasRef.value.getBoundingClientRect();
  lastX.value = e.clientX - rect.left;
  lastY.value = e.clientY - rect.top;
}

// 绘画中
function draw(e) {
  if (!isDrawing.value || !ctx.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  ctx.value.beginPath();
  ctx.value.moveTo(lastX.value, lastY.value);
  ctx.value.lineTo(x, y);
  ctx.value.stroke();
  
  lastX.value = x;
  lastY.value = y;
  
  // 发送画布数据到主窗口
  sendCanvasData();
}

// 停止绘画
function stopDrawing() {
  isDrawing.value = false;
}

// 清空画布
function clearCanvas() {
  if (!ctx.value || !canvasRef.value) return;
  ctx.value.fillStyle = "#ffffff";
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  sendCanvasData();
}

// 发送画布数据到主窗口，并保存到 store
function sendCanvasData() {
  if (!canvasRef.value) return;
  
  try {
    const dataUrl = canvasRef.value.toDataURL("image/png");
    
    // 保存到 store（会同步到 localStorage，子窗口可读取）
    store.updatePanelState("canvas", { dataUrl });
    
    // 同时通过事件通知预览面板
    emit("canvas-data-update", {
      panelId: props.panelId,
      dataUrl: dataUrl,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("发送画布数据失败:", error);
  }
}

// 下载画布
function downloadCanvas() {
  if (!canvasRef.value) return;
  
  const link = document.createElement("a");
  link.download = `drawing-${Date.now()}.png`;
  link.href = canvasRef.value.toDataURL("image/png");
  link.click();
}

// 组件卸载时发送最终画布数据
onUnmounted(() => {
  sendCanvasData();
});
</script>

<template>
  <div class="canvas-panel">
    <div class="canvas-toolbar">
      <div class="tool-group">
        <button 
          :class="{ active: currentTool === 'brush' }" 
          @click="currentTool = 'brush'"
          title="画笔"
        >
          ✏️
        </button>
        <button 
          :class="{ active: currentTool === 'eraser' }" 
          @click="currentTool = 'eraser'"
          title="橡皮擦"
        >
          🧹
        </button>
      </div>
      
      <div class="tool-group">
        <label>大小:</label>
        <input 
          type="range" 
          v-model.number="brushSize" 
          min="1" 
          max="50" 
          class="size-slider"
        />
        <span class="size-label">{{ brushSize }}px</span>
      </div>
      
      <div class="tool-group">
        <label>颜色:</label>
        <input 
          type="color" 
          v-model="brushColor" 
          class="color-picker"
        />
      </div>
      
      <div class="tool-group">
        <button @click="clearCanvas" title="清空画布">🗑️</button>
        <button @click="downloadCanvas" title="下载图片">💾</button>
      </div>
    </div>
    
    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        class="drawing-canvas"
      />
    </div>
  </div>
</template>

<style scoped>
.canvas-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.canvas-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-group button {
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-group button:hover {
  background: var(--bg-hover);
}

.tool-group button.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.tool-group label {
  font-size: 12px;
  color: var(--text-secondary);
}

.size-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: var(--accent-color);
  border-radius: 50%;
  cursor: pointer;
}

.size-label {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
}

.color-picker {
  width: 32px;
  height: 24px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.canvas-container {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 16px;
}

.drawing-canvas {
  background: white;
  border: 1px solid var(--border-color);
  cursor: crosshair;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>