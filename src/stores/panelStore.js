import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const usePanelStore = defineStore("panel", () => {
  // 布局状态：哪些面板打开
  const openPanels = ref(["project", "doc1"]);
  const rightTab = ref("properties");
  const bottomTab = ref("terminal");

  // 拖拽事件队列（用于跨组件通信）
  const dragEvent = ref(null);

  // 内容状态：每个面板的数据
  const panelStates = ref({
    canvas: { dataUrl: "" },
    terminal: { history: [], output: [] },
  });

  // 添加面板
  function addPanel(panelId) {
    if (!openPanels.value.includes(panelId)) {
      openPanels.value.push(panelId);
      syncToStorage();
    }
  }

  // 移除面板
  function removePanel(panelId) {
    const index = openPanels.value.indexOf(panelId);
    if (index !== -1) {
      openPanels.value.splice(index, 1);
      syncToStorage();
    }
  }

  // 获取面板状态
  function getPanelState(panelId) {
    return panelStates.value[panelId] || {};
  }

  // 更新面板状态
  function updatePanelState(panelId, state) {
    panelStates.value[panelId] = {
      ...panelStates.value[panelId],
      ...state,
    };
    syncToStorage();
  }

  // 触发拖拽事件
  function triggerDragOut(panelId) {
    dragEvent.value = { panelId, timestamp: Date.now() };
  }

  // 移动面板到新位置
  function movePanel(panelId, targetZone) {
    // 这里可以实现面板位置的调整逻辑
    console.log(`移动面板 ${panelId} 到 ${targetZone}`);
    syncToStorage();
  }

  // 序列化面板状态（用于传递给子窗口）
  function serializePanelState(panelId) {
    return JSON.stringify({
      id: panelId,
      state: panelStates.value[panelId],
    });
  }

  // 反序列化面板状态（子窗口接收）
  function deserializePanelState(data) {
    const { id, state } = JSON.parse(data);
    panelStates.value[id] = state;
    return id;
  }

  // 同步到 localStorage
  function syncToStorage() {
    localStorage.setItem(
      "panelLayout",
      JSON.stringify({
        openPanels: openPanels.value,
        rightTab: rightTab.value,
        bottomTab: bottomTab.value,
      })
    );
    localStorage.setItem("panelStates", JSON.stringify(panelStates.value));
  }

  // 从 localStorage 恢复
  function restoreFromStorage() {
    const layout = localStorage.getItem("panelLayout");
    const states = localStorage.getItem("panelStates");
    if (layout) {
      const data = JSON.parse(layout);
      openPanels.value = data.openPanels || ["project", "doc1"];
      rightTab.value = data.rightTab || "properties";
      bottomTab.value = data.bottomTab || "terminal";
    }
    if (states) {
      panelStates.value = { ...panelStates.value, ...JSON.parse(states) };
    }
  }

  // 初始化时恢复
  restoreFromStorage();

  // 监听变化自动同步
  watch(openPanels, syncToStorage, { deep: true });

  return {
    openPanels,
    rightTab,
    bottomTab,
    panelStates,
    dragEvent,
    addPanel,
    removePanel,
    movePanel,
    getPanelState,
    updatePanelState,
    triggerDragOut,
    serializePanelState,
    deserializePanelState,
    syncToStorage,
    restoreFromStorage,
  };
});
