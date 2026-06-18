<script setup>
import { ref } from "vue";

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
  <div class="terminal-panel">
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
</template>

<style scoped>
.terminal-panel {
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
</style>
