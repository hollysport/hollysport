"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/*
 * Antrenman Merkezi filtreleri için editoryal siyah/yeşil tema uyumlu
 * açılır menüler (tekli + çoklu seçim). Dışarı tıklama ve Esc ile kapanır.
 */

type Option = {
    value: string;
    label: string;
};

const triggerClass =
    "flex w-full items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#050505] px-4 py-3 text-sm font-medium text-white outline-none transition hover:border-white/30 focus:border-[#27D66B]";

const panelClass =
    "absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-1.5 shadow-[0_24px_60px_rgba(0,0,0,0.65)]";

function useDismissOnOutside(
    open: boolean,
    onClose: () => void,
) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: MouseEvent) {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener(
                "mousedown",
                handlePointerDown,
            );
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose]);

    return ref;
}

function FieldLabel({ children }: { children: string }) {
    return (
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {children}
        </span>
    );
}

export function SingleSelect({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useDismissOnOutside(open, () => setOpen(false));

    const selectedLabel =
        options.find((option) => option.value === value)?.label ??
        label;

    return (
        <div ref={ref} className="relative">
            <FieldLabel>{label}</FieldLabel>

            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-haspopup="listbox"
                className={triggerClass}
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${
                        open ? "rotate-180 text-[#27D66B]" : ""
                    }`}
                />
            </button>

            {open && (
                <div role="listbox" className={panelClass}>
                    {options.map((option) => {
                        const isSelected = option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                                    isSelected
                                        ? "bg-[#27D66B]/10 font-semibold text-[#27D66B]"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                {option.label}
                                {isSelected && (
                                    <Check className="h-4 w-4 text-[#27D66B]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function MultiSelect({
    label,
    options,
    values,
    onToggle,
}: {
    label: string;
    options: Option[];
    values: string[];
    onToggle: (value: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useDismissOnOutside(open, () => setOpen(false));

    const summary =
        values.length === 0
            ? "Bölge seç"
            : `${values.length} bölge seçili`;

    return (
        <div ref={ref} className="relative">
            <FieldLabel>{label}</FieldLabel>

            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-haspopup="listbox"
                className={triggerClass}
            >
                <span className="truncate">
                    {summary}
                </span>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-white/40 transition-transform ${
                        open ? "rotate-180 text-[#27D66B]" : ""
                    }`}
                />
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-multiselectable="true"
                    className={`${panelClass} max-h-72 overflow-y-auto`}
                >
                    {options.map((option) => {
                        const isSelected = values.includes(
                            option.value,
                        );

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => onToggle(option.value)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                                    isSelected
                                        ? "bg-[#27D66B]/10 font-semibold text-[#27D66B]"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                                <span
                                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition ${
                                        isSelected
                                            ? "border-[#27D66B] bg-[#27D66B] text-black"
                                            : "border-white/25"
                                    }`}
                                >
                                    {isSelected && (
                                        <Check className="h-3 w-3" />
                                    )}
                                </span>
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
