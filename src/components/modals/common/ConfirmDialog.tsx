import { AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    pendingLabel?: string;
    isConfirming?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    icon?: ReactNode;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    pendingLabel = "Deleting…",
    isConfirming = false,
    onConfirm,
    onCancel,
    icon,
}: ConfirmDialogProps) {
    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center modal-overlay px-4"
            role="dialog"
            aria-modal="true"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card)"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                    {icon ?? <AlertTriangle className="h-6 w-6" />}
                </div>

                <h2 className="mt-4 text-center text-lg font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">{description}</p>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isConfirming}
                        className="flex-1 cursor-pointer rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className="flex-1 cursor-pointer rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isConfirming ? pendingLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
