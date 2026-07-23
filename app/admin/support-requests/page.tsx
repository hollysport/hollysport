import SupportRequestActions from "@/components/admin/support-request-actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    contacted: "İletişime geçildi",
    in_review: "Değerlendiriliyor",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    completed: "Tamamlandı",
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
    financial_support: "Maddi destek görüşmesi",
    mentorship_network: "Mentorluk ve bağlantı",
    other: "Diğer",
};

const visibilityLabels: Record<string, string> = {
    full: "Tam ad soyad",
    surname_masked: "Soyadı sansürlü",
    initials_masked: "Yalnızca baş harfler",
};

export default async function SupportRequestsPage() {
    await requireAdmin();

    const supabase = await createClient();

    const { data: requests, error } = await supabase
        .from("support_requests")
        .select(`
      id,
      full_name,
      phone,
      email,
      city,
      support_types,
      volunteer_roles,
      organization_name,
      website,
      amount_type,
      estimated_amount,
      message,
      name_visibility,
      display_consent,
      status,
      created_at
    `)
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
                        Destek Başvuruları
                    </h1>

                    <p className="mt-3 text-zinc-600">
                        Gönüllü, bireysel ve kurumsal destek başvurularını
                        buradan yönetebilirsin.
                    </p>
                </div>

                {!requests || requests.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
                        Henüz destek başvurusu bulunmuyor.
                    </div>
                ) : (
                    <div className="mt-10 grid gap-6 lg:grid-cols-2">
                        {requests.map((request) => (
                            <article
                                key={request.id}
                                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-950">
                                            {request.full_name}
                                        </h2>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            {new Intl.DateTimeFormat("tr-TR", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            }).format(new Date(request.created_at))}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700">
                                        {statusLabels[request.status] ?? request.status}
                                    </span>
                                </div>

                                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                                    <div>
                                        <dt className="font-semibold text-zinc-950">
                                            Telefon
                                        </dt>
                                        <dd className="mt-1 text-zinc-600">
                                            {request.phone}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="font-semibold text-zinc-950">
                                            E-posta
                                        </dt>
                                        <dd className="mt-1 break-all text-zinc-600">
                                            {request.email || "Belirtilmedi"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="font-semibold text-zinc-950">
                                            Şehir
                                        </dt>
                                        <dd className="mt-1 text-zinc-600">
                                            {request.city || "Belirtilmedi"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="font-semibold text-zinc-950">
                                            İsim görünürlüğü
                                        </dt>
                                        <dd className="mt-1 text-zinc-600">
                                            {visibilityLabels[request.name_visibility] ??
                                                request.name_visibility}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-zinc-950">
                                        Destek türleri
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {request.support_types.map((type: string) => (
                                            <span
                                                key={type}
                                                className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700"
                                            >
                                                {supportTypeLabels[type] ?? type}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {request.organization_name && (
                                    <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
                                        <p className="text-sm font-semibold text-zinc-950">
                                            Kurum
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-600">
                                            {request.organization_name}
                                        </p>

                                        {request.website && (
                                            <p className="mt-1 break-all text-sm text-zinc-500">
                                                {request.website}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {request.estimated_amount !== null && (
                                    <div className="mt-6 rounded-2xl bg-green-50 p-4">
                                        <p className="text-sm font-semibold text-green-900">
                                            Tahmini destek tutarı
                                        </p>

                                        <p className="mt-1 text-lg font-bold text-green-700">
                                            {new Intl.NumberFormat("tr-TR", {
                                                style: "currency",
                                                currency: "TRY",
                                            }).format(Number(request.estimated_amount))}
                                        </p>
                                    </div>
                                )}

                                {request.message && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-semibold text-zinc-950">
                                            Açıklama
                                        </h3>

                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-600">
                                            {request.message}
                                        </p>
                                    </div>
                                )}

                                <SupportRequestActions
                                    request={{
                                        id: request.id,
                                        full_name: request.full_name,
                                        name_visibility: request.name_visibility,
                                        display_consent: request.display_consent,
                                        support_types: request.support_types,
                                        status: request.status,
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