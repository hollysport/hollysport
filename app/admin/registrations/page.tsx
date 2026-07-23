import Link from "next/link";

import RegistrationActions from "@/components/admin/registration-actions";
import { requireAdmin } from "@/lib/auth/require-admin";

type RegistrationStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "waitlist"
    | "cancelled";

type RegistrationItem = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    gender: string | null;
    notes: string | null;
    status: RegistrationStatus;
    created_at: string;
    event: {
        id: string;
        title: string;
        slug: string;
        starts_at: string;
        location: string;
        capacity: number | null;
        participant_count: number;
    } | null;
};

const statusLabels: Record<RegistrationStatus, string> = {
    pending: "Bekliyor",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    waitlist: "Bekleme listesi",
    cancelled: "İptal edildi",
};

const statusClasses: Record<RegistrationStatus, string> = {
    pending: "bg-blue-500/15 text-blue-300",
    approved: "bg-[#27D66B]/15 text-[#27D66B]",
    rejected: "bg-red-500/15 text-red-300",
    waitlist: "bg-yellow-500/15 text-yellow-300",
    cancelled: "bg-white/10 text-white/45",
};

const genderLabels: Record<string, string> = {
    female: "Kadın",
    male: "Erkek",
    other: "Diğer",
    prefer_not_to_say: "Belirtmek istemiyor",
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function RegistrationList({
    title,
    description,
    registrations,
}: {
    title: string;
    description: string;
    registrations: RegistrationItem[];
}) {
    return (
        <section className="mt-16">
            <div className="mb-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {title}
                        </h2>

                        <p className="mt-2 text-sm text-white/40">
                            {description}
                        </p>
                    </div>

                    <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/40">
                        {registrations.length} başvuru
                    </span>
                </div>
            </div>

            {registrations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-white/35">
                    Bu bölümde başvuru bulunmuyor.
                </div>
            ) : (
                <div className="space-y-4">
                    {registrations.map((registration) => (
                        <article
                            key={registration.id}
                            className="rounded-2xl border border-white/10 bg-[#111111] p-6 md:p-7"
                        >
                            <div className="grid gap-8 lg:grid-cols-[1fr_1fr_auto]">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClasses[
                                                registration.status
                                                ]
                                                }`}
                                        >
                                            {
                                                statusLabels[
                                                registration.status
                                                ]
                                            }
                                        </span>

                                        <span className="text-xs text-white/30">
                                            {formatDate(
                                                registration.created_at,
                                            )}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 text-2xl font-semibold">
                                        {registration.full_name}
                                    </h3>

                                    <div className="mt-4 space-y-2 text-sm text-white/45">
                                        <p>
                                            <span className="text-white/25">
                                                E-posta:
                                            </span>{" "}
                                            <a
                                                href={`mailto:${registration.email}`}
                                                className="transition-colors hover:text-[#27D66B]"
                                            >
                                                {registration.email}
                                            </a>
                                        </p>

                                        <p>
                                            <span className="text-white/25">
                                                Telefon:
                                            </span>{" "}
                                            <a
                                                href={`tel:${registration.phone}`}
                                                className="transition-colors hover:text-[#27D66B]"
                                            >
                                                {registration.phone}
                                            </a>
                                        </p>

                                        <p>
                                            <span className="text-white/25">
                                                Cinsiyet:
                                            </span>{" "}
                                            <span className="font-semibold text-white/70">
                                                {registration.gender
                                                    ? genderLabels[
                                                    registration.gender
                                                    ] ??
                                                    registration.gender
                                                    : "Belirtilmedi"}
                                            </span>
                                        </p>
                                    </div>

                                    {registration.notes && (
                                        <div className="mt-5 rounded-xl bg-white/[0.04] p-4">
                                            <span className="text-xs uppercase tracking-wider text-white/25">
                                                Katılımcı notu
                                            </span>

                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/50">
                                                {registration.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs uppercase tracking-wider text-white/25">
                                        Etkinlik
                                    </span>

                                    {registration.event ? (
                                        <>
                                            <h4 className="mt-3 text-xl font-semibold">
                                                {registration.event.title}
                                            </h4>

                                            <p className="mt-3 text-sm text-[#27D66B]">
                                                {formatDate(
                                                    registration.event
                                                        .starts_at,
                                                )}
                                            </p>

                                            <p className="mt-2 text-sm text-white/40">
                                                {
                                                    registration.event
                                                        .location
                                                }
                                            </p>

                                            <p className="mt-4 text-sm text-white/35">
                                                Katılımcı:{" "}
                                                {
                                                    registration.event
                                                        .participant_count
                                                }
                                                {registration.event
                                                    .capacity !== null
                                                    ? ` / ${registration.event.capacity}`
                                                    : ""}
                                            </p>

                                            <Link
                                                href={`/events/${registration.event.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-5 inline-flex text-xs font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
                                            >
                                                Etkinliği görüntüle ↗
                                            </Link>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm text-red-300">
                                            Etkinlik bilgisi bulunamadı.
                                        </p>
                                    )}
                                </div>

                                <div className="lg:min-w-72">
                                    <span className="mb-4 block text-xs uppercase tracking-wider text-white/25">
                                        Başvuru işlemleri
                                    </span>

                                    <RegistrationActions
                                        registrationId={registration.id}
                                        currentStatus={registration.status}
                                        applicantName={
                                            registration.full_name
                                        }
                                    />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default async function AdminRegistrationsPage() {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
        .from("event_registrations")
        .select(`
            id,
            full_name,
            email,
            phone,
            gender,
            notes,
            status,
            created_at,
            event:events (
                id,
                title,
                slug,
                starts_at,
                location,
                capacity,
                participant_count
            )
        `)
        .order("created_at", { ascending: false });

    const registrations =
        (data ?? []) as unknown as RegistrationItem[];

    const pendingRegistrations = registrations.filter(
        (registration) => registration.status === "pending",
    );

    const approvedRegistrations = registrations.filter(
        (registration) => registration.status === "approved",
    );

    const waitlistRegistrations = registrations.filter(
        (registration) => registration.status === "waitlist",
    );


    return (
        <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-7 border-b border-white/10 pb-9 md:flex-row md:items-end">
                    <div>
                        <Link
                            href="/admin"
                            className="text-sm font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
                        >
                            ← Yönetim paneli
                        </Link>

                        <h1 className="mt-7 text-4xl font-bold tracking-tight md:text-6xl">
                            Etkinlik başvuruları
                        </h1>

                        <p className="mt-4 max-w-2xl leading-7 text-white/40">
                            Katılımcı başvurularını incele, onayla, bekleme
                            listesine al veya kalıcı olarak sil.
                        </p>
                    </div>

                    <div className="rounded-full border border-white/10 px-5 py-3 text-sm text-white/45">
                        Toplam {registrations.length} başvuru
                    </div>
                </header>

                {error && (
                    <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
                        Başvurular yüklenirken hata oluştu:{" "}
                        {error.message}
                    </div>
                )}

                <RegistrationList
                    title="Bekleyen başvurular"
                    description="Henüz değerlendirilmemiş yeni başvurular."
                    registrations={pendingRegistrations}
                />

                <RegistrationList
                    title="Onaylanan başvurular"
                    description="Etkinliğe katılımı onaylanan kişiler."
                    registrations={approvedRegistrations}
                />

                <RegistrationList
                    title="Bekleme listesi"
                    description="Kontenjan veya değerlendirme nedeniyle bekletilen kişiler."
                    registrations={waitlistRegistrations}
                />


            </div>
        </main>
    );
}