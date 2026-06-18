// 窗口管理工具（简化版）
// 实际的窗口创建逻辑现在在 AppLayout.vue 中通过 watch store.dragEvent 处理

export function generateChildRoute(panelId) {
  // doc1 -> /#/doc1
  const num = panelId.replace("doc", "");
  return `/#/doc${num}`;
}

export function isValidPanel(panelId) {
  const validIds = [
    "project",
    "doc1", "doc2", "doc3", "doc4",
    "properties", "chat", "settings", "help",
    "terminal", "output",
  ];
  return validIds.includes(panelId);
}

export function isDocPanel(panelId) {
  return /^doc\d+$/.test(panelId);
}

export function getDocPanels(openPanels) {
  return openPanels.filter((p) => isDocPanel(p));
}
