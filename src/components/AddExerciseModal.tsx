import { X, Plus, DumbbellIcon } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function AddExerciseModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg p-8 duration-200 shadow-2xl rounded-4xl bg-background animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}

                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">
                            Add exercise to library
                        </h2>

                        <p className="mt-1 text-muted-foreground">
                            Available to every plan.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 transition-colors border rounded-lg cursor-pointer hover:bg-muted border-border"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}

                <div className="mt-6 space-y-4">

                    <div className="flex gap-3">
                        <div className="flex items-center justify-center px-5 text-2xl border bg-muted rounded-2xl border-border">
                            <DumbbellIcon />
                        </div>

                        <input
                            placeholder="Exercise name"
                            className="w-full px-4 border outline-none bg-muted h-14 rounded-2xl border-border"
                        />
                    </div>

                    <input
                        placeholder="Muscle group (e.g. Chest)"
                        className="w-full px-4 border outline-none bg-muted h-14 rounded-2xl border-border"
                    />

                    <div className="grid grid-cols-3 gap-3 ">

                        <div className="p-3 border bg-muted rounded-2xl border-border">
                            <p className="text-xs uppercase text-muted-foreground">Sets</p>

                            <input
                                defaultValue={3}
                                type="number"
                                className="w-full mt-1 text-3xl font-bold bg-transparent outline-none"
                            />
                        </div>

                        <div className="p-3 border bg-muted rounded-2xl border-border">
                            <p className="text-xs uppercase text-muted-foreground">Reps</p>

                            <input
                                defaultValue={10}
                                type="number"
                                className="w-full mt-1 text-3xl font-bold bg-transparent outline-none"
                            />
                        </div>

                        <div className="p-3 border bg-muted rounded-2xl border-border">
                            <p className="text-xs uppercase text-muted-foreground">Kg</p>

                            <input
                                defaultValue={0}
                                type="number"
                                className="w-full mt-1 text-3xl font-bold bg-transparent outline-none"
                            />
                        </div>
                    </div>

                    <textarea
                        rows={4}
                        placeholder="How to perform..."
                        className="w-full p-4 border outline-none resize-none bg-muted rounded-2xl border-border"
                    />

                    <input
                        placeholder="Video / GIF URL (optional)"
                        className="w-full px-4 border outline-none bg-muted h-14 rounded-2xl border-border"
                    />

                    <button className="flex items-center justify-center w-full gap-2 font-semibold bg-ink text-ink-foreground h-14 rounded-2xl hover:opacity-90">
                        <Plus size={18} />
                        Save exercise
                    </button>
                </div>
            </div>
        </div>
    );
}