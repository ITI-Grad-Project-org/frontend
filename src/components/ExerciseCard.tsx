import { DumbbellIcon, Pencil, Trash2 } from "lucide-react";
import CardMain from "./Cards/CardMain";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type ExerciseCardProps = {
    thumbnail: string;
    name: string;
    muscle: string;
    sets: number;
    reps: number;
    weight: number;
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

export default function ExerciseCard({
    thumbnail,
    name,
    muscle,
    sets,
    reps,
    weight,
}: ExerciseCardProps) {
    return (
        <CardMain>
            <div className="flex items-start justify-between">
                <Avatar className="w-14 h-14">
                    <AvatarImage src={thumbnail} />
                    <AvatarFallback><DumbbellIcon /></AvatarFallback>
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

                <p className="text-muted-foreground mt-1">{muscle}</p>
            </div>

            <div className="flex gap-3">
                <Stat label="Sets" value={sets} />
                <Stat label="Reps" value={reps} />
                <Stat label="kg" value={weight} />
            </div>
        </CardMain>
    );
}