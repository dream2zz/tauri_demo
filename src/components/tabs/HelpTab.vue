<script setup>
</script>

<template>
  <div class="help-tab">
    <h3 class="section-title">帮助</h3>

    <div class="help-content">
      <div class="help-section">
        <h4>快捷键</h4>
        <ul>
          <li><kbd>Ctrl</kbd> + <kbd>N</kbd> - 新建文档</li>
          <li><kbd>Ctrl</kbd> + <kbd>W</kbd> - 关闭文档</li>
          <li><kbd>Ctrl</kbd> + <kbd>S</kbd> - 保存</li>
        </ul>
      </div>

      <div class="help-section">
        <h4>拖拽功能</h4>
        <p>拖动标签页到窗口外部可以创建新窗口。</p>
      </div>

      <div class="help-section">
        <h4>关于</h4>
        <p>Window Demo v0.1.0</p>
        <p>基于 Tauri + Vue 3 构建</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-tab {
  height: 100%;
  overflow-y: auto;
}

.section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.help-section h4 {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.help-section p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.help-section ul {
  list-style: none;
  padding: 0;
}

.help-section li {
  font-size: 13px;
  color: var(--text-secondary);
  padding: 4px 0;
}

kbd {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 12px;
  font-family: monospace;
}
</style>
