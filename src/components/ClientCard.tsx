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
                <div className="flex flex-col align-top items-start">
                    <p className="font-dispaly text-xl font-bold">{name}</p>
                    <p className="text-muted-foreground text-sm">{info}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-3 rounded-2xl flex flex-col items-start gap-1">
                    <span className="text-xs text-muted-foreground font-medium">Weight</span>
                    <span className="text-lg font-bold text-foreground">{weight}</span>
                </div>
                <div className="bg-muted/50 p-3 rounded-2xl flex flex-col items-start gap-1">
                    <span className="text-xs text-muted-foreground font-medium">Height</span>
                    <span className="text-lg font-bold text-foreground">{height}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-ink text-ink-foreground text-sm font-semibold py-3 px-4 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer">
                    <Dumbbell className="w-4 h-4" strokeWidth={2.5} />
                    <span>Create plan</span>
                </button>
                <button className="flex items-center justify-center gap-2 bg-brand text-brand-foreground text-sm font-semibold py-3 px-4 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer">
                    <Utensils className="w-4 h-4" strokeWidth={2.5} />
                    <span>Create nutrition</span>
                </button>
            </div>
        </CardMain>
    )
}

export default ClientCard