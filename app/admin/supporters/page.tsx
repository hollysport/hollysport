import SupporterActions from "@/components/admin/supporter-actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import AddSupporterForm from "@/components/admin/add-supporter-form";

const categoryLabels: Record<string, string> = {
    individual: "Bireysel destekçi",
    volunteer: "Gönüllü destekçi",
    angel_investor: "Stratejik yatırımcı",
};

const supportTypeLabels: Record<string, string> = {
    volunteer: "Gönüllü destek",
    social_media: "Sosyal medya",
    photo_video: "Fotoğraf ve video",
    design_content: "Grafik tasarım ve içerik",
    software: "Yazılım ve teknik destek",
    event_operations: "Etkinlik ve organizasyon",
    transport_logistics: "Ulaşım ve lojistik",
    venue: "Mekân desteği",
    equipment_product: "Ekipman veya ürün",
    corporate_sponsorship: "Kurumsal sponsorluk",
    financial_support: "Maddi destek",
    mentorship_network: "Mentorluk ve bağlantı",
    other: "Diğer",
};

export default async function SupportersAdminPage() {
    await requireAdmin();

    const supabase = await createClient();

    const { data: supporters, error } = await supabase
        .from("individual_supporters")
        .select(`
      id,
      display_name,
      support_types,
      supporter_category,
      is_active,
      created_at
    `)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
    }

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                        Admin Paneli
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-zinc-950">
                        Yayınlanan Destekçiler
                    </h1>

                    <p className="mt-3 text-zinc-600">
                        Ana sayfada gösterilen bireysel destekçileri buradan
                        yönetebilirsin.
                    </p>
                </div>

                <AddSupporterForm />

                {!supporters || supporters.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
                        Henüz yayınlanan destekçi bulunmuyor.
                    </div>
                ) : (
                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {supporters.map((supporter) => (
                            <article
                                key={supporter.id}
                                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-950">
                                            {supporter.display_name}
                                        </h2>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            {categoryLabels[
                                                supporter.supporter_category
                                            ] ?? supporter.supporter_category}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${supporter.is_active
                                            ? "bg-green-50 text-green-700"
                                            : "bg-zinc-100 text-zinc-600"
                                            }`}
                                    >
                                        {supporter.is_active
                                            ? "Yayında"
                                            : "Gizli"}
                                    </span>
                                </div>

                                {supporter.support_types.length > 0 && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {supporter.support_types.map(
                                            (type: string) => (
                                                <span
                                                    key={type}
                                                    className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700"
                                                >
                                                    {supportTypeLabels[type] ?? type}
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}

                                <p className="mt-5 text-xs text-zinc-400">
                                    {new Intl.DateTimeFormat("tr-TR", {
                                        dateStyle: "medium",
                                    }).format(new Date(supporter.created_at))}
                                </p>

                                <SupporterActions
                                    supporter={{
                                        id: supporter.id,
                                        supporter_category:
                                            supporter.supporter_category,
                                        is_active: supporter.is_active,
                                    }}
                                />
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}