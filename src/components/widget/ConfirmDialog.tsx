interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-xs rounded-xl border border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1.5 text-sm text-neutral-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg bg-neutral-200 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-300"
            onClick={onCancel}
          >
            {cancelLabel ?? "取消"}
          </button>
          <button
            type="button"
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white hover:bg-sky-600"
            onClick={onConfirm}
          >
            {confirmLabel ?? "确定"}
          </button>
        </div>
      </div>
    </div>
  );
}
