import { X, Plus, UtensilsCrossed } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function AddMealModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-4xl bg-background p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Add meal to library</h2>
                        <p className="text-muted-foreground mt-1">Available to every plan.</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer border border-border"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    <div className="flex gap-3">
                        <div className="bg-muted px-5 flex items-center justify-center rounded-2xl text-2xl border border-border">
                            <UtensilsCrossed />
                        </div>

                        <input
                            placeholder="Meal name"
                            className="bg-muted h-14 w-full rounded-2xl px-4 outline-none border border-border"
                        />
                    </div>

                    {/* <input
                        placeholder="Category (e.g. Breakfast)"
                        className="bg-muted h-14 w-full rounded-2xl px-4 outline-none border border-border"
                    /> */}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted rounded-2xl p-3 border border-border">
                            <p className="text-xs text-muted-foreground uppercase">Calories</p>
                            <input
                                defaultValue={350}
                                type="number"
                                className="mt-1 w-full bg-transparent text-3xl font-bold outline-none"
                            />
                        </div>

                        <div className="bg-muted rounded-2xl p-3 border border-border">
                            <p className="text-xs text-muted-foreground uppercase">Protein</p>
                            <input
                                defaultValue={25}
                                type="number"
                                className="mt-1 w-full bg-transparent text-3xl font-bold outline-none"
                            />
                        </div>

                        <div className="bg-muted rounded-2xl p-3 border border-border">
                            <p className="text-xs text-muted-foreground uppercase">Carbs</p>
                            <input
                                defaultValue={45}
                                type="number"
                                className="mt-1 w-full bg-transparent text-3xl font-bold outline-none"
                            />
                        </div>

                        <div className="bg-muted rounded-2xl p-3 border border-border">
                            <p className="text-xs text-muted-foreground uppercase">Fats</p>
                            <input
                                defaultValue={10}
                                type="number"
                                className="mt-1 w-full bg-transparent text-3xl font-bold outline-none"
                            />
                        </div>
                    </div>

                    <textarea
                        rows={4}
                        placeholder="Ingredients or notes..."
                        className="bg-muted w-full resize-none rounded-2xl p-4 outline-none border border-border"
                    />

                    <input
                        placeholder="Image URL (optional)"
                        className="bg-muted h-14 w-full rounded-2xl px-4 outline-none border border-border"
                    />

                    <button className="bg-ink text-ink-foreground flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-semibold hover:opacity-90">
                        <Plus size={18} />
                        Save meal
                    </button>
                </div>
            </div>
        </div>
    );
}
