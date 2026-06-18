<script setup>
import { ref } from "vue";

const properties = ref([
  { name: "宽度", value: "100%", type: "text" },
  { name: "高度", value: "auto", type: "text" },
  { name: "背景色", value: "#ffffff", type: "color" },
  { name: "边框", value: "1px solid #ccc", type: "text" },
  { name: "圆角", value: "8px", type: "text" },
  { name: "内边距", value: "16px", type: "text" },
]);
</script>

<template>
  <div class="properties-tab">
    <h3 class="section-title">属性配置</h3>
    <div class="property-list">
      <div v-for="prop in properties" :key="prop.name" class="property-item">
        <label class="property-label">{{ prop.name }}</label>
        <input
          v-model="prop.value"
          :type="prop.type"
          class="property-input"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-tab {
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

.property-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.property-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.property-input {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.property-input:focus {
  border-color: var(--accent-color);
  outline: none;
}
</style>
