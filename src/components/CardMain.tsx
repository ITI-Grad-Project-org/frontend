import { type ReactNode } from 'react'

function CardMain({ children }: { children: ReactNode }) {
    return (
        <div className='card-surface p-6 min-h-[160px] flex flex-col justify-between gap-2.5'>{children}</div>
    )
}

export default CardMain