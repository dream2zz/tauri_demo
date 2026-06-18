<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { listen } from "@tauri-apps/api/event";

const previewImage = ref(null);
const lastUpdate = ref(null);
const isReceiving = ref(false);

// 监听画布数据更新
let unlistenCanvasData = null;

onMounted(async () => {
  try {
    unlistenCanvasData = await listen("canvas-data-update", (event) => {
      const { dataUrl, timestamp } = event.payload;
      previewImage.value = dataUrl;
      lastUpdate.value = new Date(timestamp).toLocaleTimeString();
      isReceiving.value = true;
    });
  } catch (error) {
    console.error("监听画布数据失败:", error);
  }
});

onUnmounted(() => {
  if (unlistenCanvasData) {
    unlistenCanvasData();
  }
});

// 清空预览
function clearPreview() {
  previewImage.value = null;
  lastUpdate.value = null;
  isReceiving.value = false;
}
</script>

<template>
  <div class="preview-panel">
    <div class="preview-header">
      <h3 class="preview-title">实时预览</h3>
      <div class="preview-status">
        <span v-if="isReceiving" class="status-receiving">● 接收中</span>
        <span v-else class="status-idle">○ 等待数据</span>
      </div>
      <button v-if="previewImage" @click="clearPreview" class="clear-btn">
        清空
      </button>
    </div>
    
    <div class="preview-content">
      <div v-if="previewImage" class="preview-image-container">
        <img :src="previewImage" alt="画布预览" class="preview-image" />
        <div class="preview-info">
          <span>最后更新: {{ lastUpdate }}</span>
        </div>
      </div>
      <div v-else class="preview-placeholder">
        <div class="placeholder-icon">🎨</div>
        <p>画笔面板的内容将在此实时显示</p>
        <p class="hint">拖动画笔面板到窗口外开始绘画</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.preview-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin: 0;
}

.preview-status {
  font-size: 11px;
}

.status-receiving {
  color: #28a745;
}

.status-idle {
  color: var(--text-secondary);
}

.clear-btn {
  padding: 2px 6px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.preview-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.preview-image-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-image {
  max-width: 100%;
  max-height: calc(100% - 24px);
  object-fit: contain;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: white;
}

.preview-info {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
}

.preview-placeholder {
  text-align: center;
  color: var(--text-secondary);
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.preview-placeholder p {
  margin: 4px 0;
}

.hint {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.7;
}
</style>