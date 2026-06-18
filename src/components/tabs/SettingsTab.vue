<script setup>
import { ref } from "vue";

const settings = ref({
  theme: "dark",
  fontSize: 14,
  autoSave: true,
  language: "zh-CN",
});
</script>

<template>
  <div class="settings-tab">
    <h3 class="section-title">应用设置</h3>

    <div class="setting-list">
      <div class="setting-item">
        <label class="setting-label">主题</label>
        <select v-model="settings.theme" class="setting-select">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">跟随系统</option>
        </select>
      </div>

      <div class="setting-item">
        <label class="setting-label">字体大小</label>
        <input
          v-model.number="settings.fontSize"
          type="number"
          min="10"
          max="24"
          class="setting-input"
        />
      </div>

      <div class="setting-item">
        <label class="setting-label">自动保存</label>
        <input
          v-model="settings.autoSave"
          type="checkbox"
          class="setting-checkbox"
        />
      </div>

      <div class="setting-item">
        <label class="setting-label">语言</label>
        <select v-model="settings.language" class="setting-select">
          <option value="zh-CN">简体中文</option>
          <option value="en-US">English</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-tab {
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

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label {
  font-size: 13px;
  color: var(--text-primary);
}

.setting-select,
.setting-input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.setting-select:focus,
.setting-input:focus {
  border-color: var(--accent-color);
  outline: none;
}

.setting-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
</style>
