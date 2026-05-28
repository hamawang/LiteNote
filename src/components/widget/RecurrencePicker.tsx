import { useState } from "react";
import type { Locale } from "@/i18n";
import type { MessageKey } from "@/i18n/messages";
import { t } from "@/i18n";
import type { RecurrenceType } from "@/types/todo";

interface RecurrencePickerProps {
  locale: Locale;
  open: boolean;
  recurrenceType: RecurrenceType;
  onConfirm: (type: RecurrenceType, config: string, dueDate: number) => void;
  onCancel: () => void;
}

const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * 计算初始 dueDate 时间戳
 * - daily: 今天或明天的指定时间（如果今天该时间已过则用明天）
 * - weekly: 下一个指定星期几的指定时间
 * - monthly: 下一个指定日期的指定时间
 */
function computeInitialDueDate(
  type: RecurrenceType,
  hour: number,
  minute: number,
  weekday?: number,
  dayOfMonth?: number,
): number {
  const now = new Date();

  switch (type) {
    case "daily": {
      const target = new Date(now);
      target.setHours(hour, minute, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }
      return target.getTime();
    }
    case "weekly": {
      const wd = weekday ?? now.getDay();
      const target = new Date(now);
      target.setHours(hour, minute, 0, 0);

      const currentDay = target.getDay();
      if (wd === currentDay && target.getTime() > now.getTime()) {
        // 今天就是目标日且时间未过
        return target.getTime();
      }
      // 找到下一个目标日
      let daysUntil = wd - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      target.setDate(target.getDate() + daysUntil);
      return target.getTime();
    }
    case "monthly": {
      const dom = dayOfMonth ?? now.getDate();

      // 构建本月目标日（手动年月避免 setMonth 滚动）
      let y = now.getFullYear();
      let m = now.getMonth();
      const maxDayThisMonth = new Date(y, m + 1, 0).getDate();
      const d = Math.min(dom, maxDayThisMonth);

      let target = new Date(y, m, d, hour, minute, 0, 0);

      if (target.getTime() <= now.getTime()) {
        // 推到下个月
        m += 1;
        if (m > 11) {
          m = 0;
          y += 1;
        }
        const maxDayNext = new Date(y, m + 1, 0).getDate();
        const nd = Math.min(dom, maxDayNext);
        target = new Date(y, m, nd, hour, minute, 0, 0);
      }
      return target.getTime();
    }
    default:
      return 0;
  }
}

export function RecurrencePicker({
  locale,
  open,
  recurrenceType,
  onConfirm,
  onCancel,
}: RecurrencePickerProps) {
  const now = new Date();
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(0);
  const [weekday, setWeekday] = useState(now.getDay());
  const [dayOfMonth, setDayOfMonth] = useState(now.getDate());

  if (!open) return null;

  const mk = (key: MessageKey) => t(locale, key);
  const isZh = locale === "zh-CN";
  const wdLabels = isZh ? WEEKDAYS_ZH : WEEKDAYS_EN;

  const handleConfirm = () => {
    const dueDate = computeInitialDueDate(
      recurrenceType,
      hour,
      minute,
      recurrenceType === "weekly" ? weekday : undefined,
      recurrenceType === "monthly" ? dayOfMonth : undefined,
    );

    let config: Record<string, unknown> = { interval: 1 };
    if (recurrenceType === "weekly") {
      config = { interval: 1, days: [weekday] };
    } else if (recurrenceType === "monthly") {
      config = { interval: 1, dayOfMonth };
    }

    onConfirm(recurrenceType, JSON.stringify(config), dueDate);
  };

  const btnBase =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition";
  const btnActive =
    `${btnBase} border-sky-400 bg-sky-100 text-sky-700`;
  const btnNormal =
    `${btnBase} border-neutral-300 text-neutral-700 hover:bg-neutral-100`;

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/30"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-80 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">
          {mk(`recurTitle${recurrenceType.charAt(0).toUpperCase() + recurrenceType.slice(1)}` as MessageKey)}
        </h3>

        {/* 每周：星期选择 */}
        {recurrenceType === "weekly" ? (
          <div className="mb-3">
            <div className="mb-1.5 text-xs text-neutral-500">{mk("recurPickDay")}</div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={weekday === d ? btnActive : btnNormal}
                  onClick={() => setWeekday(d)}
                >
                  {wdLabels[d]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* 每月：日期选择 */}
        {recurrenceType === "monthly" ? (
          <div className="mb-3">
            <div className="mb-1.5 text-xs text-neutral-500">{mk("recurPickDayOfMonth")}</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1 && v <= 31) setDayOfMonth(v);
                }}
                className="w-16 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900 text-center focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
              <span className="text-sm text-neutral-600">
                {isZh ? "号" : "th"}
              </span>
            </div>
          </div>
        ) : null}

        {/* 时间选择 */}
        <div className="mb-1">
          <div className="mb-1.5 text-xs text-neutral-500">{mk("recurPickTime")}</div>
          <div className="flex items-center gap-2">
            <select
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value, 10))}
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900 focus:border-sky-400 focus:outline-none"
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-sm text-neutral-500">:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(parseInt(e.target.value, 10))}
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-neutral-900 focus:border-sky-400 focus:outline-none"
            >
              {minOptions.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-300"
            onClick={onCancel}
          >
            {mk("cancel")}
          </button>
          <button
            type="button"
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white hover:bg-sky-600"
            onClick={handleConfirm}
          >
            {mk("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
