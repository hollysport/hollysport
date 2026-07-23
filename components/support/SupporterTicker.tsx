"use client";

import type { CSSProperties } from "react";

type SupporterTickerProps = {
    names: string[];
    emptyMessage?: string;
};

export default function SupporterTicker({
    names,
    emptyMessage = "Bireysel yatırımcılarımız yakında burada görünecek.",
}: SupporterTickerProps) {
    const uniqueNames = Array.from(
        new Set(names.map((name) => name.trim()).filter(Boolean)),
    );

    if (uniqueNames.length === 0) {
        return (
            <div className="flex h-56 items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 text-center text-sm text-zinc-400">
                {emptyMessage}
            </div>
        );
    }

    const containerHeight = 224;
    const itemHeight = 48;
    const gapHeight = 24;

    const groupHeight = Math.max(
        containerHeight + gapHeight,
        uniqueNames.length * itemHeight + gapHeight,
    );

    const animationDuration = Math.max(12, groupHeight / 19);

    const animationStyle = {
        "--ticker-distance": `${groupHeight}px`,
        "--ticker-duration": `${animationDuration}s`,
        "--ticker-group-height": `${groupHeight}px`,
        "--ticker-content-height": `${groupHeight - gapHeight}px`,
    } as CSSProperties;

    return (
        <div className="group relative h-56 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div
                style={animationStyle}
                className="animate-supporter-scroll-down group-hover:[animation-play-state:paused]"
            >
                {[0, 1].map((groupIndex) => (
                    <div
                        key={groupIndex}
                        style={{
                            height: "var(--ticker-group-height)",
                        }}
                    >
                        <div
                            style={{
                                height: "var(--ticker-content-height)",
                            }}
                            className="flex flex-col justify-around"
                        >
                            {uniqueNames.map((name, index) => (
                                <div
                                    key={`${groupIndex}-${name}-${index}`}
                                    className="flex h-12 shrink-0 items-center justify-center border-b border-white/5 px-4 text-center font-semibold text-white"
                                >
                                    {name}
                                </div>
                            ))}
                        </div>

                        <div style={{ height: `${gapHeight}px` }} />
                    </div>
                ))}
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-2 bg-gradient-to-b from-zinc-950 to-transparent" />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
    );
}