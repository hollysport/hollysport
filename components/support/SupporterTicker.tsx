"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type SupporterTickerProps = {
    names: string[];
    emptyMessage?: string;
};

const visibleLimit = 8;

export default function SupporterTicker({
    names,
    emptyMessage = "Bireysel yatırımcılarımız yakında burada görünecek.",
}: SupporterTickerProps) {
    const [showAll, setShowAll] = useState(false);

    const uniqueNames = Array.from(
        new Set(
            names
                .map((name) => name.trim())
                .filter(Boolean),
        ),
    );

    if (uniqueNames.length === 0) {
        return (
            <div className="flex min-h-56 items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 text-center text-sm text-zinc-400">
                {emptyMessage}
            </div>
        );
    }

    const visibleNames = showAll
        ? uniqueNames
        : uniqueNames.slice(0, visibleLimit);

    const hasMore = uniqueNames.length > visibleLimit;

    return (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="divide-y divide-white/10">
                {visibleNames.map((name, index) => (
                    <div
                        key={`${name}-${index}`}
                        className="flex min-h-14 items-center px-5 py-3 sm:px-6"
                    >
                        <span className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#27D66B]/10 text-xs font-bold text-[#27D66B]">
                            {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="font-semibold text-white">
                            {name}
                        </span>
                    </div>
                ))}
            </div>

            {hasMore && (
                <button
                    type="button"
                    onClick={() => setShowAll((current) => !current)}
                    aria-expanded={showAll}
                    className="flex min-h-14 w-full items-center justify-center gap-2 border-t border-white/10 px-5 text-sm font-semibold text-[#27D66B] transition-colors hover:bg-white/5"
                >
                    {showAll ? (
                        <>
                            Daha az göster
                            <ChevronUp className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Daha fazla göster
                            <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}