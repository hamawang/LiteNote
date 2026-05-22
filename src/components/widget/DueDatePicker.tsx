import { useState } from "react";
import type { Locale } from "@/i18n";
import { t } from "@/i18n";

interface DueDatePickerProps {
  locale: Locale;
  open: boolean;
  onConfirm: (ts: number) => void;
  onCancel: () => void;
}

function toDatetimeLocalStr(ts: number): string {
  const d = new Date(ts || Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DueDatePicker({ locale, open, onConfirm, onCancel }: DueDatePickerProps) {
  const [value, setValue] = useState(() => toDatetimeLocalStr(Date.now() + 3600000));

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/30"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">
          {t(locale, "duePickerTitle")}
        </h3>
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-300"
            onClick={onCancel}
          >
            {t(locale, "cancel")}
          </button>
          <button
            type="button"
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white hover:bg-sky-600"
            onClick={() => onConfirm(new Date(value).getTime())}
          >
            {t(locale, "confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
