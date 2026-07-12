import AddExerciseModal from "@/components/AddExerciseModal";
import CardMain from "@/components/Cards/CardMain"
import { Chip } from "@/components/Chip";
import ExerciseCard from "@/components/ExerciseCard";
import { Plus, Search, UserRoundPlus } from "lucide-react"
import { useState } from "react";

function Exercises() {
    const exercises = [
        {
            thumbnail: "https://www.wikihow.com/images/thumb/5/5f/Do-a-Barbell-Bench-Press-Step-4.jpg/v4-460px-Do-a-Barbell-Bench-Press-Step-4.jpg",
            name: "Barbell Bench Press",
            muscle: "Chest",
            sets: 4,
            reps: 10,
            weight: 60,
        },
        {
            thumbnail: "https://cdn.shopify.com/s/files/1/1497/9682/files/2_cfb27f9d-2dea-40d7-9229-5899794c8f31.jpg?v=1653566234",
            name: "Back Squat",
            muscle: "Legs",
            sets: 5,
            reps: 8,
            weight: 80,
        },
        {
            thumbnail: "https://www.kettlebellkings.com/cdn/shop/articles/barbell-deadlift-movement_1200x1200_crop_center.gif?v=1692228918",
            name: "Deadlift",
            muscle: "Back",
            sets: 4,
            reps: 5,
            weight: 100,
        },
        {
            thumbnail: "https://hips.hearstapps.com/hmg-prod/images/pull-up-647dd51506791.gif?resize=980:*",
            name: "Pull-Up",
            muscle: "Back",
            sets: 4,
            reps: 8,
            weight: 0,
        },
        {
            thumbnail: "https://www.kettlebellkings.com/cdn/shop/articles/Standing-Barbell-Military-Press_1200x1200_crop_center.gif?v=1729493815",
            name: "Overhead Press",
            muscle: "Shoulders",
            sets: 4,
            reps: 8,
            weight: 40,
        },
        {
            thumbnail: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif",
            name: "Dumbbell Row",
            muscle: "Back",
            sets: 3,
            reps: 12,
            weight: 22,
        },
        {
            thumbnail: "https://static.strengthlevel.com/images/exercises/incline-dumbbell-bench-press/incline-dumbbell-bench-press-800.jpg",
            name: "Incline DB Press",
            muscle: "Chest",
            sets: 4,
            reps: 10,
            weight: 24,
        },
        {
            thumbnail: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif",
            name: "Romanian Deadlift",
            muscle: "Hamstrings",
            sets: 4,
            reps: 10,
            weight: 70,
        },
        {
            thumbnail: "https://fitnessprogramer.com/wp-content/uploads/2021/02/plank.gif",
            name: "Plank",
            muscle: "Core",
            sets: 3,
            reps: 60,
            weight: 0,
        },
        {
            thumbnail: "https://fitnessprogramer.com/wp-content/uploads/2021/06/Treadmill-.gif",
            name: "Treadmill Run",
            muscle: "Cardio",
            sets: 1,
            reps: 20,
            weight: 0,
        },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="flex flex-col gap-3.5">

            <div className="flex flex-wrap justify-between">
                <h1 className="text-4xl font-black font-display">Exercises</h1>
                <div>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-opacity cursor-pointer bg-brand text-brand-foreground rounded-2xl hover:opacity-90">
                            <UserRoundPlus className="w-4 h-4" strokeWidth={2.5} />
                            <span>Custom for Clients</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-opacity cursor-pointer bg-ink text-ink-foreground rounded-2xl hover:opacity-90" >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            <span>Add to library</span>
                        </button>
                    </div>
                </div>
            </div>


            <CardMain className="">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input value={""} onChange={(e) => e} placeholder="Search exercises…"
                        className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground" />
                </div>
            </CardMain>


            <section className="mt-12 space-y-8">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-semibold ">Library</h2>
                    <Chip className="font-bold">{exercises.length}</Chip>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {exercises.map((exercise) => (
                        <ExerciseCard
                            key={exercise.name}
                            {...exercise}
                        />
                    ))}
                </div>

                <div className="mt-12 space-y-4">
                    <div className="flex items-center gap-3 ">
                        <h2 className="text-3xl font-semibold ">Custom — per client</h2>
                        <Chip color="orange" className="font-bold">0</Chip>
                    </div>

                    <CardMain>
                        No client-specific exercises yet.
                    </CardMain>
                </div>
            </section>



            <AddExerciseModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

        </div>
    )
}

export default Exercises