"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2 } from "lucide-react";

import { seedExercises } from "@/app/admin/exercises/actions";

export default function SeedExercisesButton() {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSeed() {
        setBusy(true);
        setMessage("");

        const result = await seedExercises();

        setBusy(false);

        if (!result.success) {
            setMessage(result.error ?? "Seed işlemi başarısız.");
            return;
        }

        setMessage(
            `${result.inserted ?? 0} egzersiz yüklendi. Liste güncelleniyor…`,
        );
        router.refresh();
    }

    return (
        <div className="mt-6 rounded-2xl border border-dashed border-[#27D66B]/30 bg-[#27D66B]/5 px-6 py-10 text-center">
            <Database className="mx-auto h-8 w-8 text-[#27D66B]" />
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-600">
                Henüz egzersiz yok. Hazır 3D egzersiz veri setini
                (9 kas grubu, Ev/Salon, hedef bazlı) tek tıkla yükle.
            </p>

            <button
                type="button"
                onClick={handleSeed}
                disabled={busy}
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-[#27D66B] px-6 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f] disabled:opacity-50"
            >
                {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Database className="h-4 w-4" />
                )}
                Hazır Egzersizleri Yükle (Seed)
            </button>

            {message && (
                <p className="mt-3 text-xs text-zinc-500">{message}</p>
            )}
        </div>
    );
}
