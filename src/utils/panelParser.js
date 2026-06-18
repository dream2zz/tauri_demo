// 面板类型枚举
export const PANEL_TYPES = {
  PROJECT: "project",
  DOC: "doc",
  PROPERTIES: "properties",
  CHAT: "chat",
  SETTINGS: "settings",
  HELP: "help",
  TERMINAL: "terminal",
  OUTPUT: "output",
};

// 从路由路径解析面板列表
export function parsePanelsFromRoute(routePath) {
  // /panels/project/doc1/doc2/terminal
  const segments = routePath.split("/").filter(Boolean);
  if (segments[0] !== "panels") return [];

  return segments.slice(1).map((seg) => {
    if (seg.startsWith("doc")) {
      return { type: PANEL_TYPES.DOC, id: seg, number: parseInt(seg.slice(3)) };
    }
    return { type: seg, id: seg };
  });
}

// 从面板列表生成路由路径
export function generateRoutePath(panels) {
  const segments = panels.map((p) => p.id || p);
  return `/panels/${segments.join("/")}`;
}

// 生成子窗口路由
export function generateChildRoute(panelId) {
  return `/#/${panelId}`;
}

// 验证面板 ID 是否有效
export function isValidPanel(panelId) {
  const validIds = [
    "project",
    "doc1", "doc2", "doc3", "doc4",
    "properties", "chat", "settings", "help",
    "terminal", "output",
  ];
  return validIds.includes(panelId);
}

// 判断是否为文档面板
export function isDocPanel(panelId) {
  return /^doc\d+$/.test(panelId);
}

// 获取所有文档面板
export function getDocPanels(openPanels) {
  return openPanels.filter((p) => isDocPanel(p));
}
