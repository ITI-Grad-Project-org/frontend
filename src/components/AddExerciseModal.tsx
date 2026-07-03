import { X, Plus, DumbbellIcon } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function AddExerciseModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35  p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-4xl bg-background p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}

                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">
                            Add exercise to library
                        </h2>

                        <p className="text-muted-foreground mt-1">
                            Available to every plan.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}

                <div className="mt-6 space-y-4">

                    <div className="flex gap-3">
                        <div className="bg-muted px-5 flex items-center justify-center rounded-2xl text-2xl border border-border">
                            <DumbbellIcon />
                        </div>

                        <input
                            placeholder="Exercise name"
                            className="bg-muted h-14 w-full rounded-2xl px-4 outline-none border border-border"
                        />
                    </div>

                    <input
                        placeholder="Muscle group (e.g. Chest)"
                        className="bg-muted h-14 w-full rounded-2xl px-4 outline-none border border-border"
                    />

                    <div className="grid grid-cols-3 gap-3 ">

                        <div className="bg-muted rounded-2xl p-3 border border-border">
                            <p className="text-xs text-muted-foreground uppercase">Sets</p>

                            <input
                                defaultValue={3}
                                type="number"
                                className="mt-1 w-full bg-transparent text-3xl font-bold outline-none"
                            />
                        </div>

                        <div className="bg-muted rounded-2xl p-3 border border-border">
                            <p className="text-xs text-muted-foreground uppercase">Reps</p>

                            <input
                                defaultValue={10}
                                type="number"
                                className="mt-1 w-full bg-transparent text-3xl font-bold outline-none"
                            />
                        </div>

                        <div className="bg-muted rounded-2xl p-3 border border-border">
                            <p className="text-xs text-muted-foreground uppercase">Kg</p>

                            <input
                                defaultValue={0}
                                type="number"
                                className="mt-1 w-full bg-transparent text-3xl font-bold outline-none"
                            />
                        </div>
                    </div>

                    <textarea
                        rows={4}
                        placeholder="How to perform..."
                        className="bg-muted w-full resize-none rounded-2xl p-4 outline-none border border-border"
                    />

                    <input
                        placeholder="Video / GIF URL (optional)"
                        className="bg-muted h-14 w-full rounded-2xl px-4 outline-none border border-border"
                    />

                    <button className="bg-ink text-ink-foreground flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold hover:opacity-90">
                        <Plus size={18} />
                        Save exercise
                    </button>
                </div>
            </div>
        </div>
    );
}