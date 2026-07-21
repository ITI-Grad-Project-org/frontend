import React from 'react'

function InvitationSkeleton() {
    return (
        <div className="w-full flex items-center justify-between p-5 border border-border bg-card rounded-2xl animate-pulse">
            <div className="flex items-center gap-4.5 w-1/2">
                <div className="w-10 h-10 rounded-xl bg-muted shrink-0" />
                <div className="flex flex-col gap-2 w-full">
                    <div className="h-4.5 bg-muted rounded w-1/3" />
                    <div className="h-3.5 bg-muted rounded w-1/2" />
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="h-6 w-16 bg-muted rounded-full" />
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded-xl" />
            </div>
        </div>
    );
}

export default InvitationSkeleton