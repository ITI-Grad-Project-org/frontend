import AddMealModal from "@/components/AddMealModal";
import CardMain from "@/components/Cards/CardMain";
import { Chip } from "@/components/Chip";
import MealCard from "@/components/MealCard";
import { Plus, Search, UserRoundPlus } from "lucide-react";
import { useState } from "react";

function Meals() {
    const meals = [
        {
            thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
            name: "Chicken Salad Bowl",
            calories: 420,
            protein: 35,
            carbs: 28,
            fats: 18,
        },
        {
            thumbnail: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
            name: "Salmon Rice Plate",
            calories: 560,
            protein: 40,
            carbs: 45,
            fats: 22,
        },
        {
            thumbnail: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80",
            name: "Greek Yogurt Bowl",
            calories: 310,
            protein: 24,
            carbs: 30,
            fats: 10,
        },
        {
            thumbnail: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
            name: "Turkey Wrap",
            calories: 390,
            protein: 28,
            carbs: 35,
            fats: 14,
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap justify-between">
                <h1 className="text-4xl font-black font-display animate-in fade-in slide-in-from-left-3 duration-600">Meals</h1>
                <div>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-opacity cursor-pointer bg-brand text-brand-foreground rounded-2xl hover:opacity-90">
                            <UserRoundPlus className="w-4 h-4" strokeWidth={2.5} />
                            <span>Custom for Clients</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-opacity cursor-pointer bg-ink text-ink-foreground rounded-2xl hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            <span>Add to library</span>
                        </button>
                    </div>
                </div>
            </div>

            <CardMain className="animate-in fade-in slide-in-from-left-3 duration-800">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input
                        value={""}
                        onChange={(e) => e}
                        placeholder="Search meals…"
                        className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </CardMain>

            <section className="mt-12 space-y-8">
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-3 duration-600">
                    <h2 className="text-3xl font-semibold">Library</h2>
                    <Chip className="font-bold">{meals.length}</Chip>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 animate-in fade-in slide-in-from-left-3 duration-800">
                    {meals.map((meal) => (
                        <MealCard key={meal.name} {...meal} />
                    ))}
                </div>

                <div className="mt-12 space-y-4">
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-3 duration-600">
                        <h2 className="text-3xl font-semibold">Custom — per client</h2>
                        <Chip color="orange" className="font-bold">0</Chip>
                    </div>

                    <CardMain>No client-specific meals yet.</CardMain>
                </div>
            </section>

            <AddMealModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default Meals