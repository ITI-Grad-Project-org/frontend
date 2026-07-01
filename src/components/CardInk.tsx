import type { ReactNode } from "react"

function CardInk({ children }: { children: ReactNode }) {
    return (
        <div className="card-ink p-6 min-h-[160px] flex flex-col justify-between gap-2.5">{children}</div>
    )
}

export default CardInk