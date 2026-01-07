"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string
    name?: string
}

export function Avatar({ src, name, className, ...props }: AvatarProps) {
    const [hasError, setHasError] = React.useState(false)

    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : ""

    return (
        <div
            className={cn(
                "relative flex shrink- overflow-hidden rounded-full bg-muted",
                className
            )}
            {...props}
        >
            {src && !hasError ? (
                <img
                    src={src}
                    alt={name || "Avatar"}
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-slate-600 font-medium">
                    {initials}
                </div>
            )}
        </div>
    )
}
