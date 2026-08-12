function Overview() {
    return (
        <>
            <div className="animate-text">
                <p className="font-sans text-sm text-muted-foreground">
                    Good morning, Coach 👋
                </p>
                <h1 className="mb-12 text-6xl font-black text-foreground">
                    Dashboard
                </h1>
            </div>

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" />
            </div>
        </>
    );
}

export default Overview;