"use client";

import { useState } from "react";

import SupporterTicker from "@/components/support/SupporterTicker";

/*
 * Ana sayfa destekçi listesi paneli.
 *
 * "Destekçilerimiz" kartının başlığı altında yan yana iki buton:
 *  - Aktif Yatırımcılar → admin panelinde aktif (yayında) işaretlenenler
 *  - Tüm Zamanlar       → aktif + pasif tüm kayıtlar (geçmiş kayıtlar
 *                          silinmez, yalnızca gizlenir)
 *
 * Liste verisi sunucu tarafından tek sorguyla çekilir; buton yalnızca
 * hangi listenin gösterileceğini istemcide seçer (sayfa yenilenmez).
 */

type ListMode = "active" | "all";

type SupporterTickerPanelProps = {
    activeNames: string[];
    allNames: string[];
    emptyMessage?: string;
};

const modeOptions: Array<{ key: ListMode; label: string }> = [
    { key: "active", label: "Aktif Yatırımcılar" },
    { key: "all", label: "Tüm Zamanlar" },
];

export default function SupporterTickerPanel({
    activeNames,
    allNames,
    emptyMessage,
}: SupporterTickerPanelProps) {
    const [mode, setMode] = useState<ListMode>("active");

    const names = mode === "active" ? activeNames : allNames;

    return (
        <SupporterTicker
            /* Mod değişince "Daha fazla göster" katlanma durumu sıfırlanır */
            key={mode}
            names={names}
            emptyMessage={emptyMessage}
            toolbar={
                <div
                    role="group"
                    aria-label="Destekçi listesi görünümü"
                    className="flex flex-row flex-wrap items-center gap-2 sm:gap-3"
                >
                    {modeOptions.map((option) => {
                        const isSelected = mode === option.key;

                        return (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setMode(option.key)}
                                aria-pressed={isSelected}
                                className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold transition sm:min-h-11 sm:px-5 ${
                                    isSelected
                                        ? "bg-[#27D66B] text-ink hover:bg-[#1fc461]"
                                        : "border border-line bg-white text-ink-soft hover:text-ink"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            }
        />
    );
}
