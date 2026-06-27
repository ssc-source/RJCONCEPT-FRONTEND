import { useToastStore } from '../../stores/toastStore';

const typeStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export default function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-4 py-4 shadow-lg ${typeStyles[toast.type] || typeStyles.info}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm opacity-90">{toast.description}</p> : null}
            </div>
            <button type="button" className="text-xs font-semibold opacity-70 hover:opacity-100" onClick={() => dismissToast(toast.id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
