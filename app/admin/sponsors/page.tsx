import SponsorManager from "@/components/admin/sponsor-manager";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export default async function SponsorsAdminPage() {
    await requireAdmin();

    const supabase = await createClient();

    const { data: sponsors, error } = await supabase
        .from("sponsors")
        .select(`
      id,
      name,
      logo_path,
      logo_storage_path,
      website,
      category,
      is_active,
      sort_order
    `)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

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
                        Kurumsal Destekçiler
                    </h1>

                    <p className="mt-3 text-zinc-600">
                        Firma ve kurum logolarını ekle, kategorilerini belirle ve
                        ana sayfadaki yayın durumlarını yönet.
                    </p>
                </div>

                <SponsorManager sponsors={sponsors ?? []} />
            </div>
        </main>
    );
}