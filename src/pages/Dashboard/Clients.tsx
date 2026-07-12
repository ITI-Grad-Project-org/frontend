import ClientCard from "@/components/ClientCard"
interface dummyClients {
    id: number;
    name: string;
    info: string;
    weight: string;
    height: string;
    AvatarImageSrc: string;
}

function Clients() {
    const dummyClients: dummyClients[] | [] = [
        { id: 0, name: "Max Tyson", info: "Intermediate · Bulking", weight: "78 kg", height: "178 cm", AvatarImageSrc: "https://www.landfood.ubc.ca/files/2025/04/IMG_0837-1-e1750374490980.png" },
        { id: 1, name: "Sara Lee", info: "Beginner · Cutting", weight: "62 kg", height: "168 cm", AvatarImageSrc: "https://as1.ftcdn.net/jpg/03/82/78/76/1000_F_382787674_JmU69nTp1qEUwh0kxBeThK60my6MBYSL.jpg" },
        { id: 2, name: "Jon Rivera", info: "Advanced · Recomp", weight: "84 kg", height: "182 cm", AvatarImageSrc: "https://m.media-amazon.com/images/M/MV5BNzhiNjFkNzgtNjhkNS00Mjc3LTk0ZWMtNzA3Y2ZmNzFmZWQyXkEyXkFqcGc@._V1_.jpg" },
        { id: 3, name: "Aya Kim", info: "Intermediate · Endurance", weight: "56 kg", height: "162 cm", AvatarImageSrc: "https://avatars.githubusercontent.com/u/77188666?v=4" }
    ];

    if (!dummyClients || dummyClients.length === 0) {
        return (
            <>
                <h1 className="mb-12 text-4xl font-black font-display animate-text">Clients</h1>
                <div className="flex flex-col items-center justify-center duration-500 border border-dashed min-h-75 border-border rounded-3xl bg-muted/20 animate-in fade-in">
                    <p className="text-lg font-medium text-muted-foreground">No clients found</p>
                    <p className="mt-1 text-sm text-muted-foreground/70">When clients register, they will appear here.</p>
                </div>
            </>
        )
    }

    return (
        <>
            <h1 className="mb-12 text-4xl font-black font-display animate-text">Clients</h1>

            <div className="flex flex-col gap-6 animate-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {dummyClients.map((client, index) => (
                        <ClientCard
                            key={client.id || index}
                            name={client.name}
                            info={client.info}
                            weight={client.weight}
                            height={client.height}
                            AvatarImageSrc={client.AvatarImageSrc}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}

export default Clients