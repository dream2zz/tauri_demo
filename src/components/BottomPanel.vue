<script setup>
import { ref } from "vue";
import { usePanelStore } from "../stores/panelStore";

const store = usePanelStore();

const tabs = [
  { id: "terminal", label: "终端" },
  { id: "output", label: "输出" },
  { id: "problems", label: "问题" },
];

const terminalInput = ref("");
const terminalOutput = ref(["欢迎使用终端", "$ "]);

function executeCommand() {
  const cmd = terminalInput.value.trim();
  if (!cmd) return;

  terminalOutput.value.push(`$ ${cmd}`);
  terminalOutput.value.push(`命令已执行: ${cmd}`);
  terminalOutput.value.push("$ ");

  terminalInput.value = "";
}
</script>

<template>
  <div class="bottom-panel">
    <!-- Tab 栏 -->
    <div class="tabs-bar">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: store.bottomTab === tab.id }"
        @click="store.bottomTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="panel-content">
      <div v-if="store.bottomTab === 'terminal'" class="terminal">
        <div class="terminal-output">
          <div v-for="(line, i) in terminalOutput" :key="i" class="terminal-line">
            {{ line }}
          </div>
        </div>
        <div class="terminal-input">
          <input
            v-model="terminalInput"
            @keyup.enter="executeCommand"
            placeholder="输入命令..."
            class="input-field"
          />
        </div>
      </div>
      <div v-else-if="store.bottomTab === 'output'" class="output">
        <p>输出内容将显示在这里...</p>
      </div>
      <div v-else class="problems">
        <p>没有问题</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bottom-panel {
  height: 200px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border-color);
}

.tabs-bar {
  display: flex;
  height: 30px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.tab-item {
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  background: var(--bg-hover);
}

.tab-item.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent-color);
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.terminal {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.terminal-output {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.terminal-line {
  line-height: 1.5;
  white-space: pre-wrap;
}

.terminal-input {
  display: flex;
  padding: 4px 12px 8px;
  border-top: 1px solid var(--border-color);
}

.input-field {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: inherit;
  outline: none;
}

.output, .problems {
  padding: 12px;
  color: var(--text-secondary);
}
</style>
