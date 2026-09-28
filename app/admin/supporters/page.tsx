import Link from "next/link";

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

type SupportersPageProps = {
    searchParams: Promise<{
        durum?: string;
    }>;
};

type StatusFilter = "all" | "active" | "passive";

export default async function SupportersAdminPage({
    searchParams,
}: SupportersPageProps) {
    await requireAdmin();

    const parameters = await searchParams;

    const statusFilter: StatusFilter =
        parameters.durum === "active"
            ? "active"
            : parameters.durum === "passive"
              ? "passive"
              : "all";

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

    const allSupporters = supporters ?? [];

    const counts = {
        all: allSupporters.length,
        active: allSupporters.filter((item) => item.is_active)
            .length,
        passive: allSupporters.filter((item) => !item.is_active)
            .length,
    };

    const filteredSupporters = allSupporters.filter((item) => {
        if (statusFilter === "active") return item.is_active;
        if (statusFilter === "passive") return !item.is_active;
        return true;
    });

    const filterOptions: Array<{
        key: StatusFilter;
        label: string;
        count: number;
    }> = [
        { key: "all", label: "Tümü", count: counts.all },
        { key: "active", label: "Aktif", count: counts.active },
        { key: "passive", label: "Pasif", count: counts.passive },
    ];

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

                {/* Aktif / Pasif filtresi */}
                <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1 shadow-sm">
                        {filterOptions.map((option) => {
                            const isActive =
                                statusFilter === option.key;

                            return (
                                <Link
                                    key={option.key}
                                    href={`/admin/supporters${
                                        option.key === "all"
                                            ? ""
                                            : `?durum=${option.key}`
                                    }`}
                                    aria-current={
                                        isActive
                                            ? "page"
                                            : undefined
                                    }
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                        isActive
                                            ? "bg-zinc-950 text-white"
                                            : "text-zinc-600 hover:text-zinc-950"
                                    }`}
                                >
                                    {option.label}
                                    <span
                                        className={`ml-2 text-xs ${
                                            isActive
                                                ? "text-white/60"
                                                : "text-zinc-400"
                                        }`}
                                    >
                                        {option.count}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <p className="text-sm text-zinc-500">
                        {statusFilter === "active"
                            ? `${counts.active} aktif destekçi gösteriliyor.`
                            : statusFilter === "passive"
                              ? `${counts.passive} pasif destekçi gösteriliyor.`
                              : `${counts.all} destekçi listeleniyor.`}
                    </p>
                </div>

                {filteredSupporters.length === 0 ? (
                    <div className="mt-6 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
                        {statusFilter === "active"
                            ? "Aktif destekçi bulunmuyor."
                            : statusFilter === "passive"
                              ? "Pasif destekçi bulunmuyor."
                              : "Henüz yayınlanan destekçi bulunmuyor."}
                    </div>
                ) : (
                    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredSupporters.map((supporter) => (
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