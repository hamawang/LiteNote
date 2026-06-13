import { useEffect, useRef } from "react";
import { saveSetting } from "@/lib/db";
import {
  applyFocusWindowHeight,
  DEFAULT_FULL_WINDOW_WIDTH,
  readWindowInnerSize,
  setWindowLogicalSize,
  isLikelyFullModeSize,
  isOversizedFullSize,
  resolveStoredFullSize,
  type WindowLogicalSize,
} from "@/lib/focusWindowSize";
import { useSettingsStore } from "@/stores/settingsStore";

const RESIZE_DEBOUNCE_MS = 150;

/**
 * 专注模式：按未完成条数自动调整窗口高度；退出时恢复完整模式尺寸。
 * 进入专注前会将当前完整模式尺寸写入 settings（fullWindowWidth/Height）。
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
  const fullSizeRef = useRef<WindowLogicalSize>(
    resolveStoredFullSize(fullWindowWidth, fullWindowHeight),
  );
  const didFullRestoreCheck = useRef(false);

  // 同步 DB 中的完整模式尺寸（忽略被误写入的专注/膨胀尺寸）
  useEffect(() => {
    if (!settingsReady) return;
    const resolved = resolveStoredFullSize(fullWindowWidth, fullWindowHeight);
    fullSizeRef.current = resolved;
    if (!focusMode) {
      focusWidthRef.current = resolved.width;
    }

    if (
      resolved.width !== fullWindowWidth ||
      resolved.height !== fullWindowHeight
    ) {
      void saveSetting("fullWindowWidth", resolved.width);
      void saveSetting("fullWindowHeight", resolved.height);
      useSettingsStore.setState({
        fullWindowWidth: resolved.width,
        fullWindowHeight: resolved.height,
      });
    }
  }, [settingsReady, fullWindowWidth, fullWindowHeight, focusMode]);

  // 完整模式启动：若 window-state 恢复了专注模式矮窗口，则恢复完整尺寸
  useEffect(() => {
    if (!settingsReady || focusMode || didFullRestoreCheck.current) return;
    didFullRestoreCheck.current = true;
    void (async () => {
      const current = await readWindowInnerSize();
      const full = fullSizeRef.current;
      if (!current) return;
      if (!isLikelyFullModeSize(current) && full.height > current.height) {
        await setWindowLogicalSize(full);
        return;
      }
      if (isOversizedFullSize(current)) {
        await setWindowLogicalSize(full);
      }
    })();
  }, [settingsReady, focusMode]);

  useEffect(() => {
    if (!settingsReady) return;

    let cancelled = false;
    let debounceId: number | undefined;

    const run = async () => {
      const wasFocus = prevFocusMode.current;
      prevFocusMode.current = focusMode;

      if (focusMode) {
        // 刚进入专注：仅在当前为完整模式尺寸时更新 fullWindow*，避免误存放大后的值
        if (wasFocus === false) {
          const current = await readWindowInnerSize();
          if (cancelled) return;

          if (current && isLikelyFullModeSize(current)) {
            fullSizeRef.current = { width: current.width, height: current.height };
            focusWidthRef.current = current.width;
            await saveSetting("fullWindowWidth", current.width);
            await saveSetting("fullWindowHeight", current.height);
            useSettingsStore.setState({
              fullWindowWidth: current.width,
              fullWindowHeight: current.height,
            });
          } else {
            focusWidthRef.current = fullSizeRef.current.width;
          }
        }

        await applyFocusWindowHeight(activeCount, focusWidthRef.current);
        return;
      }

      // 退出专注：恢复进入前记录的完整模式尺寸
      if (wasFocus === true) {
        await setWindowLogicalSize(fullSizeRef.current);
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
  }, [focusMode, activeCount, settingsReady]);
}
