use tauri::Manager;

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

#[tauri::command]
async fn close_child_window(app: tauri::AppHandle, panel: String) -> Result<(), String> {
    let label = format!("child_{}", panel);
    if let Some(window) = app.get_webview_window(&label) {
        let _ = window.close();
    }
    Ok(())
}

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            create_child_window,
            close_child_window,
            close_child_windows
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
