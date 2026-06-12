import { useEffect, useRef } from "react";
import { saveSetting } from "@/lib/db";
import {
  applyFocusWindowHeight,
  DEFAULT_FULL_WINDOW_HEIGHT,
  DEFAULT_FULL_WINDOW_WIDTH,
  readWindowInnerSize,
  setWindowLogicalSize,
  FOCUS_MAX_HEIGHT,
  type WindowLogicalSize,
} from "@/lib/focusWindowSize";
import { useSettingsStore } from "@/stores/settingsStore";

const RESIZE_DEBOUNCE_MS = 150;

function defaultFullSize(
  width: number | undefined,
  height: number | undefined,
): WindowLogicalSize {
  return {
    width: width ?? DEFAULT_FULL_WINDOW_WIDTH,
    height: height ?? DEFAULT_FULL_WINDOW_HEIGHT,
  };
}

/**
 * 专注模式：按未完成条数自动调整窗口高度；退出时恢复完整模式尺寸。
 * 进入专注前会将当前窗口尺寸写入 settings（fullWindowWidth/Height）。
 */
export function useFocusWindowSize(
  focusMode: boolean,
  activeCount: number,
  settingsReady: boolean,
): void {
  const fullWindowWidth = useSettingsStore((s) => s.fullWindowWidth);
  const fullWindowHeight = useSettingsStore((s) => s.fullWindowHeight);
  const prevFocusMode = useRef<boolean | null>(null);
  const focusWidthRef = useRef(DEFAULT_FULL_WINDOW_WIDTH);
  const didFullRestoreCheck = useRef(false);

  // 完整模式启动：若上次在专注模式退出导致 window-state 存了矮窗口，则恢复
  useEffect(() => {
    if (!settingsReady || focusMode || didFullRestoreCheck.current) return;
    didFullRestoreCheck.current = true;
    void (async () => {
      const current = await readWindowInnerSize();
      const full = defaultFullSize(fullWindowWidth, fullWindowHeight);
      if (
        current &&
        current.height <= FOCUS_MAX_HEIGHT + 24 &&
        full.height > current.height
      ) {
        await setWindowLogicalSize(full);
      }
    })();
  }, [settingsReady, focusMode, fullWindowWidth, fullWindowHeight]);

  useEffect(() => {
    if (!settingsReady) return;

    let cancelled = false;
    let debounceId: number | undefined;

    const run = async () => {
      const wasFocus = prevFocusMode.current;
      prevFocusMode.current = focusMode;

      if (focusMode) {
        // 刚进入专注：保存完整模式尺寸，再缩小高度
        if (wasFocus === false || wasFocus === null) {
          const current = await readWindowInnerSize();
          if (cancelled) return;

          if (current && wasFocus === false) {
            focusWidthRef.current = current.width;
            await saveSetting("fullWindowWidth", current.width);
            await saveSetting("fullWindowHeight", current.height);
            useSettingsStore.setState({
              fullWindowWidth: current.width,
              fullWindowHeight: current.height,
            });
          } else {
            focusWidthRef.current =
              fullWindowWidth ?? current?.width ?? DEFAULT_FULL_WINDOW_WIDTH;
          }
        }

        await applyFocusWindowHeight(activeCount, focusWidthRef.current);
        return;
      }

      // 退出专注：恢复完整模式尺寸
      if (wasFocus === true) {
        const full = defaultFullSize(fullWindowWidth, fullWindowHeight);
        await setWindowLogicalSize(full);
      }
    };

    const schedule = () => {
      if (debounceId !== undefined) window.clearTimeout(debounceId);
      if (focusMode && prevFocusMode.current === true) {
        debounceId = window.setTimeout(() => {
          void run();
        }, RESIZE_DEBOUNCE_MS);
      } else {
        void run();
      }
    };

    schedule();

    return () => {
      cancelled = true;
      if (debounceId !== undefined) window.clearTimeout(debounceId);
    };
  }, [
    focusMode,
    activeCount,
    settingsReady,
    fullWindowWidth,
    fullWindowHeight,
  ]);
}
