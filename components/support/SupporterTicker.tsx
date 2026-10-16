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
    emptyMessage = "Destekçilerimiz yakında burada görünecek.",
}: SupporterTickerProps) {
    const [showAll, setShowAll] = useState(false);

    const uniqueNames = Array.from(
        new Set(
            names
                .map((name) => name.trim())
                .filter(Boolean),
        ),
    );

    const visibleNames = showAll
        ? uniqueNames
        : uniqueNames.slice(0, visibleLimit);

    const hasMore = uniqueNames.length > visibleLimit;

    return (
        <div className="overflow-hidden rounded-3xl border border-line bg-shell">
            <div className="border-b border-line px-5 py-5 sm:px-6">
                <h3 className="text-lg font-bold text-ink">
                    Destekçilerimiz
                </h3>
            </div>

            {uniqueNames.length > 0 ? (
                <div className="divide-y divide-line">
                    {visibleNames.map((name) => (
                        <div
                            key={name}
                            className="flex min-h-14 items-center px-5 py-3 sm:px-6"
                        >
                            <span className="font-semibold text-ink">
                                {name}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="px-6 py-12 text-center text-sm text-ink-soft">
                    {emptyMessage}
                </div>
            )}

            {hasMore && (
                <button
                    type="button"
                    onClick={() =>
                        setShowAll((current) => !current)
                    }
                    aria-expanded={showAll}
                    className="flex min-h-14 w-full items-center justify-center gap-2 border-t border-line px-5 text-sm font-semibold text-holly-ink transition-colors hover:bg-white"
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