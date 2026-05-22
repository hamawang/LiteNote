const SETTINGS_LABEL = "settings";

function settingsPageUrl(): string {
  if (import.meta.env.DEV) {
    return "http://localhost:1420/settings.html";
  }
  return new URL("settings.html", window.location.href).href;
}

export async function openSettingsWindow(opts: {
  title: string;
  fallbackAlertBody?: string;
}): Promise<void> {
  const { title, fallbackAlertBody = "无法打开设置窗口。" } = opts;
  const url = settingsPageUrl();

  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const existing = await WebviewWindow.getByLabel(SETTINGS_LABEL);
    if (existing) {
      await existing.show();
      await existing.unminimize();
      await existing.setFocus();
      return;
    }

    const win = new WebviewWindow(SETTINGS_LABEL, {
      url,
      title,
      width: 420,
      height: 520,
      center: true,
      resizable: true,
      maximizable: false,
      decorations: true,
      preventOverflow: true,
    });

    void win.once("tauri://error", (e) => {
      console.error("settings window:", e);
    });
  } catch {
    window.alert(fallbackAlertBody);
  }
}
