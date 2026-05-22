import type { Locale } from "@/i18n";

const HELP_LABEL = "help";

function helpPageUrl(locale: Locale): string {
  const q = `lang=${encodeURIComponent(locale)}`;
  if (import.meta.env.DEV) {
    return `http://localhost:1420/help.html?${q}`;
  }
  return new URL(`help.html?${q}`, window.location.href).href;
}

export async function openHelpWindow(opts: {
  locale: Locale;
  title: string;
  fallbackAlertBody: string;
}): Promise<void> {
  const { locale, title, fallbackAlertBody } = opts;
  const url = helpPageUrl(locale);

  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const existing = await WebviewWindow.getByLabel(HELP_LABEL);
    if (existing) {
      await existing.show();
      await existing.unminimize();
      await existing.setFocus();
      return;
    }

    const win = new WebviewWindow(HELP_LABEL, {
      url,
      title,
      width: 440,
      height: 380,
      center: true,
      resizable: true,
      maximizable: false,
      decorations: true,
      preventOverflow: true,
    });

    void win.once("tauri://error", (e) => {
      console.error("help window:", e);
    });
  } catch {
    window.alert(fallbackAlertBody);
  }
}
