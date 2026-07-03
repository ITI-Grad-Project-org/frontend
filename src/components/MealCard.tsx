import { Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import CardMain from "./Cards/CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type MealCardProps = {
    thumbnail: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
};

function Stat({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="bg-muted flex flex-1 flex-col items-center rounded-2xl py-2">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className="text-lg font-bold">{value}</span>
        </div>
    );
}

export default function MealCard({
    thumbnail,
    name,
    calories,
    protein,
    carbs,
    fats,
}: MealCardProps) {
    return (
        <CardMain>
            <div className="flex items-start justify-between">
                <Avatar className="h-14 w-14">
                    <AvatarImage src={thumbnail} />
                    <AvatarFallback>
                        <UtensilsCrossed />
                    </AvatarFallback>
                </Avatar>

                <div className="flex gap-2">
                    <button className="text-muted-foreground hover:text-blue-600 cursor-pointer">
                        <Pencil size={18} />
                    </button>

                    <button className="text-muted-foreground hover:text-destructive cursor-pointer">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold leading-none">{name}</h3>
                {/* <p className="text-muted-foreground mt-1">Meal library item</p> */}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <Stat label="Calories" value={`${calories} kcal`} />
                <Stat label="Protein" value={`${protein}g`} />
                <Stat label="Carbs" value={`${carbs}g`} />
                <Stat label="Fats" value={`${fats}g`} />
            </div>
        </CardMain>
    );
}
