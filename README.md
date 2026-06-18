# Tauri + Vue 3 多窗口桌面应用

## 项目概述

这是一个基于 Tauri 2 + Vue 3 的桌面应用程序，实现了多面板布局和窗口管理功能。应用包含四个主要面板：资源管理器、画笔、终端和预览，支持将面板拖出为独立子窗口，并可拖回停靠到主窗口。

## 技术栈

### 后端
- **Tauri 2**: 桌面应用框架
- **Rust**: 后端语言
- **tauri-plugin-opener**: 文件打开插件

### 前端
- **Vue 3**: 前端框架（Composition API）
- **Vite**: 构建工具
- **Pinia**: 状态管理
- **Vue Router**: 路由管理
- **@tauri-apps/api**: Tauri 前端 API

## 项目结构

```
d:/Window_Demo/
├── src/                          # 前端源码
│   ├── assets/                   # 静态资源
│   ├── components/               # Vue 组件
│   │   ├── AppLayout.vue         # 主窗口布局
│   │   ├── ProjectPanel.vue      # 资源管理器面板
│   │   └── panels/               # 面板组件
│   │       ├── CanvasPanel.vue   # 画笔面板
│   │       └── TerminalPanel.vue # 终端面板
│   │   └── tabs/
│   │       └── PreviewPanel.vue  # 预览面板
│   ├── router/                   # 路由配置
│   │   └── index.js
│   ├── stores/                   # Pinia 状态管理
│   │   └── panelStore.js
│   ├── views/                    # 页面视图
│   │   └── ChildPanel.vue        # 子窗口面板
│   ├── utils/                    # 工具函数
│   ├── App.vue                   # 根组件
│   └── main.js                   # 入口文件
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── lib.rs                # Tauri 命令和窗口管理
│   │   └── main.rs               # Rust 入口
│   ├── capabilities/
│   │   └── default.json          # Tauri 权限配置
│   └── Cargo.toml                # Rust 依赖
├── package.json                  # 项目配置
└── vite.config.js                # Vite 配置
```

## 核心功能实现

### 1. 多窗口系统

#### Rust 后端命令

在 `src-tauri/src/lib.rs` 中实现了三个核心命令：

```rust
// 创建子窗口
#[tauri::command]
async fn create_child_window(
    app: tauri::AppHandle,
    url: String,
    title: String,
    panel: String,
    x: f64,
    y: f64,
) -> Result<(), String> {
    let label = format!("child_{}", panel);
    
    // 如果已存在同名子窗口，先关闭
    if let Some(existing) = app.get_webview_window(&label) {
        let _ = existing.close();
    }
    
    tauri::WebviewWindowBuilder::new(
        &app,
        &label,
        tauri::WebviewUrl::App(url.into()),
    )
    .title(&title)
    .inner_size(500.0, 400.0)
    .position(x, y)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

// 关闭指定子窗口
#[tauri::command]
async fn close_child_window(app: tauri::AppHandle, panel: String) -> Result<(), String> {
    let label = format!("child_{}", panel);
    if let Some(window) = app.get_webview_window(&label) {
        let _ = window.close();
    }
    Ok(())
}

// 关闭所有子窗口
#[tauri::command]
async fn close_child_windows(app: tauri::AppHandle) -> Result<(), String> {
    let windows = app.webview_windows();
    for (label, window) in windows {
        if label.starts_with("child_") {
            let _ = window.close();
        }
    }
    Ok(())
}
```

#### 前端窗口管理

在 `App.vue` 中通过 URL 参数区分主窗口和子窗口：

```javascript
// 判断是否为子窗口
const isChildWindow = ref(false);
const childPanel = ref("");
const childTitle = ref("");

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("panel")) {
    isChildWindow.value = true;
    childPanel.value = params.get("panel") || "";
    childTitle.value = decodeURIComponent(params.get("title") || "面板");
  }
});
```

### 2. 拖拽弹出机制

#### 跨屏幕坐标系统

在 `AppLayout.vue` 中实现了跨屏幕拖拽检测：

```javascript
// 鼠标释放 - 检测是否拖出窗口
function onMouseUp(event) {
  if (!dragState.value.active || !dragState.value.hasMoved) {
    resetDragState();
    return;
  }
  
  const cx = event.clientX;
  const cy = event.clientY;
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  const outOfBounds = cx <= 0 || cx >= w || cy <= 0 || cy >= h;
  
  if (outOfBounds) {
    // 使用 screenX/screenY 获取屏幕绝对坐标（跨屏幕兼容）
    popOutPanel(dragState.value.panelId, event.screenX, event.screenY);
  }
  
  resetDragState();
}
```

**关键点**：
- 使用 `event.screenX/screenY` 而非 `event.clientX/clientY`
- `screenX/screenY` 使用 Tauri 的虚拟屏幕坐标系，支持多显示器
- `clientX/clientY` 是视口相对坐标，在左侧显示器上可能为负值

#### 创建子窗口

```javascript
async function popOutPanel(panelId, mouseX, mouseY) {
  const panel = panels.value.find((p) => p.id === panelId);
  if (!panel) return;
  
  try {
    // 构建子窗口 URL（使用 Tauri 的 App URL 格式）
    const url = `/?panel=${panel.component}&title=${encodeURIComponent(panel.title)}`;
    
    await invoke("create_child_window", {
      url: url,
      title: panel.title,
      panel: panel.component,
      x: mouseX,
      y: mouseY,
    });
    
    // 标记面板已弹出
    poppedPanels.value.add(panelId);
  } catch (error) {
    console.error("创建子窗口失败:", error);
  }
}
```

### 3. 拖拽停靠机制

#### 占位区域检测

在 `AppLayout.vue` 中实现了占位区域命中检测：

```javascript
// 检查屏幕坐标是否在某个占位区域内
function checkPlaceholderHit(screenX, screenY) {
  const placeholders = document.querySelectorAll(".dock-placeholder[data-panel]");
  for (const el of placeholders) {
    const rect = el.getBoundingClientRect();
    // 将 DOM 坐标转换为屏幕坐标
    const screenLeft = rect.left + window.screenX;
    const screenTop = rect.top + window.screenY;
    const screenRight = rect.right + window.screenX;
    const screenBottom = rect.bottom + window.screenY;
    
    if (
      screenX >= screenLeft &&
      screenX <= screenRight &&
      screenY >= screenTop &&
      screenY <= screenBottom
    ) {
      return el.getAttribute("data-panel");
    }
  }
  return null;
}
```

**坐标转换原理**：
- `getBoundingClientRect()` 返回相对于视口的坐标
- `window.screenX/screenY` 返回窗口在屏幕上的偏移量
- 两者相加得到屏幕绝对坐标

#### 子窗口拖拽事件

在 `ChildPanel.vue` 中实现了两种拖拽检测方式：

**方式一：自定义 HTML 拖拽（标题栏 mousedown）**

```javascript
function onHeaderMouseDown(e) {
  if (e.button !== 0) return;
  isDragging.value = true;
  dragStartPos.value = { x: e.clientX, y: e.clientY };
  document.addEventListener("mousemove", onHeaderMouseMove);
  document.addEventListener("mouseup", onHeaderMouseUp);
}

function onHeaderMouseMove(e) {
  if (!isDragging.value) return;
  const dx = Math.abs(e.clientX - dragStartPos.value.x);
  const dy = Math.abs(e.clientY - dragStartPos.value.y);
  if (dx > 5 || dy > 5) {
    emit("child-drag-move", {
      panel: props.panel,
      screenX: e.screenX,
      screenY: e.screenY,
    });
  }
}

function onHeaderMouseUp(e) {
  document.removeEventListener("mousemove", onHeaderMouseMove);
  document.removeEventListener("mouseup", onHeaderMouseUp);
  if (!isDragging.value) return;
  
  const dx = Math.abs(e.clientX - dragStartPos.value.x);
  const dy = Math.abs(e.clientY - dragStartPos.value.y);
  if (dx > 5 || dy > 5) {
    // 拖拽结束，通知主窗口
    emit("child-drag-end", {
      panel: props.panel,
      screenX: e.screenX,
      screenY: e.screenY,
    });
  }
  isDragging.value = false;
}
```

**方式二：原生标题栏拖拽检测**

```javascript
let unlistenMoved = null;
let moveEndTimer = null;
let lastMovedPos = { x: 0, y: 0 };

async function setupNativeDragDock() {
  const win = getCurrentWindow();
  
  unlistenMoved = await win.onMoved((event) => {
    const { x, y } = event.payload;
    lastMovedPos = { x, y };
    
    // 通知主窗口：子窗口正在移动（用于高亮占位区域）
    emit("child-drag-move", {
      panel: props.panel,
      screenX: x,
      screenY: y,
    });
    
    // 防抖：每次 moved 重置计时器。200ms 内无新 moved → 鼠标已松开
    if (moveEndTimer) clearTimeout(moveEndTimer);
    moveEndTimer = setTimeout(() => {
      emit("child-drag-end", {
        panel: props.panel,
        screenX: lastMovedPos.x,
        screenY: lastMovedPos.y,
      });
    }, 200);
  });
}

setupNativeDragDock();
```

**技术难点**：
- 原生 OS 标题栏拖拽会拦截鼠标事件，`mouseup` 事件不会触发
- 使用 `win.onMoved()` 事件监听窗口位置变化
- 通过 200ms 防抖检测鼠标释放：如果 200ms 内没有新的 `moved` 事件，认为鼠标已松开

#### 事件监听和处理

```javascript
// 监听子窗口拖拽移动事件
unlistenChildDragMove = await listen("child-drag-move", (event) => {
  const { panel, screenX, screenY } = event.payload;
  childDragPanel.value = panel;
  hoveredPlaceholder.value = checkPlaceholderHit(screenX, screenY);
});

// 监听子窗口拖拽结束事件
unlistenChildDragEnd = await listen("child-drag-end", async (event) => {
  const { panel, screenX, screenY } = event.payload;
  const hitPanelId = checkPlaceholderHit(screenX, screenY);
  
  if (hitPanelId) {
    // 找到对应的面板配置
    const panelConfig = panels.value.find((p) => p.id === hitPanelId);
    if (panelConfig && panelConfig.component === panel) {
      // 停靠回来
      poppedPanels.value.delete(hitPanelId);
      // 关闭子窗口
      try {
        await invoke("close_child_window", { panel });
      } catch (err) {
        console.error("关闭子窗口失败:", err);
      }
    }
  }
  
  // 重置状态
  childDragPanel.value = null;
  hoveredPlaceholder.value = null;
});
```

### 4. 画布数据持久化

#### 问题分析

Tauri 每个窗口都有独立的 Vue/Pinia 实例，内存状态不共享。子窗口中画布数据更新到 Pinia store 后，主窗口无法直接读取。

#### 解决方案

在 `CanvasPanel.vue` 中直接读取 `localStorage`：

```javascript
function restoreCanvasFromStore() {
  // 直接从 localStorage 读取，确保拿到子窗口写入的最新数据
  let dataUrl = "";
  try {
    const states = JSON.parse(localStorage.getItem("panelStates") || "{}");
    if (states.canvas && states.canvas.dataUrl) {
      dataUrl = states.canvas.dataUrl;
    }
  } catch (e) {
    // fallback 到 store
    const saved = store.getPanelState("canvas");
    if (saved) dataUrl = saved.dataUrl || "";
  }
  
  if (dataUrl) {
    const img = new Image();
    img.onload = () => {
      if (ctx.value && canvasRef.value) {
        ctx.value.drawImage(img, 0, 0);
      }
    };
    img.src = dataUrl;
  }
}
```

**关键点**：
- `localStorage` 在 Tauri 所有窗口间共享
- Pinia store 内存实例是隔离的
- 从 `localStorage` 读取保证获取最新数据

### 5. Tauri 权限配置

在 `src-tauri/capabilities/default.json` 中配置必要的权限：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["*"],
  "permissions": [
    "core:default",
    "opener:default",
    "core:window:default",
    "core:window:allow-create",
    "core:window:allow-close",
    "core:window:allow-set-title",
    "core:window:allow-center",
    "core:window:allow-outer-position",
    "core:window:allow-outer-size",
    "core:window:allow-set-position",
    "core:window:allow-set-size",
    "core:window:allow-show",
    "core:window:allow-hide",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    "core:window:allow-unmaximize",
    "core:window:allow-toggle-maximize",
    "core:window:allow-is-visible",
    "core:window:allow-is-maximized",
    "core:window:allow-inner-size",
    "core:window:allow-inner-position",
    "core:window:allow-get-all-windows"
  ]
}
```

## 运行项目

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建生产版本
npm run tauri build
```

## 开发注意事项

1. **跨屏幕坐标**：始终使用 `screenX/screenY` 处理跨屏幕场景
2. **Pinia 状态隔离**：不同窗口的 Pinia 实例独立，需要共享的数据使用 `localStorage`
3. **原生拖拽检测**：OS 标题栏拖拽会拦截鼠标事件，使用 `onMoved` + 防抖检测
4. **占位区域命中检测**：DOM 坐标需要加上 `window.screenX/screenY` 转换为屏幕坐标
5. **子窗口标签命名**：使用 `child_{panel}` 格式确保唯一性