"use client";

import {
    Bike,
    Cat,
    Dog,
    Dumbbell,
    Flame,
    Footprints,
    Heart,
    Mountain,
    Rocket,
    Star,
    Target,
    Trophy,
    Waves,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/*
 * Preset avatar sistemi — dosya yükleme yok; seçim `profiles.avatar_url`
 * kolonunda string anahtar olarak saklanır.
 */

export type AvatarPreset = {
    key: string;
    label: string;
    Icon: LucideIcon;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
    { key: "dumbbell", label: "Dambıl", Icon: Dumbbell },
    { key: "flame", label: "Alev", Icon: Flame },
    { key: "zap", label: "Yıldırım", Icon: Zap },
    { key: "trophy", label: "Kupa", Icon: Trophy },
    { key: "footprints", label: "Adım", Icon: Footprints },
    { key: "bike", label: "Bisiklet", Icon: Bike },
    { key: "mountain", label: "Dağ", Icon: Mountain },
    { key: "waves", label: "Dalga", Icon: Waves },
    { key: "target", label: "Hedef", Icon: Target },
    { key: "rocket", label: "Roket", Icon: Rocket },
    { key: "star", label: "Yıldız", Icon: Star },
    { key: "heart", label: "Kalp", Icon: Heart },
    { key: "cat", label: "Kedi", Icon: Cat },
    { key: "dog", label: "Köpek", Icon: Dog },
];

export function AvatarIcon({
    avatar,
    className = "h-8 w-8",
}: {
    avatar: string | null;
    className?: string;
}) {
    const preset = AVATAR_PRESETS.find(
        (item) => item.key === avatar,
    );

    const Icon = preset?.Icon ?? Dumbbell;

    return <Icon className={className} aria-hidden="true" />;
}

type AvatarSelectorProps = {
    value: string | null;
    onChange: (key: string) => void;
};

export default function AvatarSelector({
    value,
    onChange,
}: AvatarSelectorProps) {
    return (
        <div
            role="radiogroup"
            aria-label="Avatar seçimi"
            className="mt-2 grid grid-cols-7 gap-2"
        >
            {AVATAR_PRESETS.map(({ key, label, Icon }) => {
                const isSelected = value === key;

                return (
                    <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={label}
                        title={label}
                        onClick={() => onChange(key)}
                        className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                            isSelected
                                ? "border-[#27D66B] bg-[#27D66B]/10 text-[#27D66B]"
                                : "border-white/10 bg-[#050505] text-white/40 hover:border-white/30 hover:text-white"
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                    </button>
                );
            })}
        </div>
    );
}
