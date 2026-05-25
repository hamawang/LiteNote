import { useEffect, useState } from "react";

/**
 * 返回当前时间戳，每秒自动刷新。
 * 用于触发逾期状态等时间依赖的 UI 更新。
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
