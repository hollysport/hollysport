import ExerciseManager from "@/components/admin/exercise-manager";
import type { Exercise } from "@/lib/data/exercises";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export default async function ExercisesAdminPage() {
    await requireAdmin();

    const supabase = await createClient();

    const { data: exercises, error } = await supabase
        .from("exercises")
        .select(
            "id, name, target_muscle, environment, sets, reps, description, created_at",
        )
        .order("target_muscle", { ascending: true })
        .order("environment", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        console.error(error);
    }

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                        Admin Paneli
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-zinc-950">
                        Egzersiz Yönetimi
                    </h1>

                    <p className="mt-3 text-zinc-600">
                        Antrenman Merkezi&apos;ndeki bölgesel
                        antrenman egzersizlerini ekle veya sil.
                    </p>
                </div>

                <ExerciseManager
                    exercises={(exercises ?? []) as Exercise[]}
                />
            </div>
        </main>
    );
}
