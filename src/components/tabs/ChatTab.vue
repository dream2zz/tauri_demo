<script setup>
import { ref } from "vue";

const messages = ref([
  { role: "assistant", content: "你好！我是 AI 助手，有什么可以帮你的？" },
]);

const inputText = ref("");

function sendMessage() {
  const text = inputText.value.trim();
  if (!text) return;

  messages.value.push({ role: "user", content: text });
  inputText.value = "";

  // 模拟 AI 回复
  setTimeout(() => {
    messages.value.push({
      role: "assistant",
      content: `收到你的消息: "${text}"。这是一个模拟回复。`,
    });
  }, 500);
}
</script>

<template>
  <div class="chat-tab">
    <h3 class="section-title">AI 聊天</h3>

    <div class="messages">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="message"
        :class="msg.role"
      >
        <div class="message-content">{{ msg.content }}</div>
      </div>
    </div>

    <div class="input-area">
      <input
        v-model="inputText"
        @keyup.enter="sendMessage"
        placeholder="输入消息..."
        class="chat-input"
      />
      <button @click="sendMessage" class="send-btn">发送</button>
    </div>
  </div>
</template>

<style scoped>
.chat-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
  background: var(--accent-color);
  color: white;
}

.message.assistant {
  align-self: flex-start;
  background: var(--bg-tertiary);
}

.message-content {
  font-size: 13px;
  line-height: 1.5;
}

.input-area {
  display: flex;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.chat-input {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.chat-input:focus {
  border-color: var(--accent-color);
  outline: none;
}

.send-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.send-btn:hover {
  background: var(--accent-hover);
}
</style>
