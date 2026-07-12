import CardMain from "./Cards/CardMain"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dumbbell, User2Icon, Utensils } from "lucide-react";

function ClientCard(props: { name: string; info: string; weight: string; height: string; AvatarImageSrc: string; }) {
    const { name, info, weight, height, AvatarImageSrc } = props;
    return (
        <CardMain>
            <div className="flex gap-3">
                <Avatar className="w-14 h-14">
                    <AvatarImage src={AvatarImageSrc} />
                    <AvatarFallback><User2Icon /></AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start align-top">
                    <p className="text-xl font-bold font-dispaly">{name}</p>
                    <p className="text-sm text-muted-foreground">{info}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-start gap-1 p-3 bg-muted/50 rounded-2xl">
                    <span className="text-xs font-medium text-muted-foreground">Weight</span>
                    <span className="text-lg font-bold text-foreground">{weight}</span>
                </div>
                <div className="flex flex-col items-start gap-1 p-3 bg-muted/50 rounded-2xl">
                    <span className="text-xs font-medium text-muted-foreground">Height</span>
                    <span className="text-lg font-bold text-foreground">{height}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-opacity cursor-pointer bg-ink text-ink-foreground rounded-2xl hover:opacity-90">
                    <Dumbbell className="w-4 h-4" strokeWidth={2.5} />
                    <span>Create plan</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-opacity cursor-pointer bg-brand text-brand-foreground rounded-2xl hover:opacity-90">
                    <Utensils className="w-4 h-4" strokeWidth={2.5} />
                    <span>Create nutrition</span>
                </button>
            </div>
        </CardMain>
    )
}

export default ClientCard