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
    pending: "bg-blue-50 text-blue-700",
    approved: "bg-green-50 text-holly-ink",
    rejected: "bg-red-50 text-red-700",
    waitlist: "bg-yellow-50 text-yellow-700",
    cancelled: "bg-shell text-ink-soft",
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

                        <p className="mt-2 text-sm text-ink-soft">
                            {description}
                        </p>
                    </div>

                    <span className="rounded-full border border-line px-4 py-2 text-sm text-ink-soft">
                        {registrations.length} başvuru
                    </span>
                </div>
            </div>

            {registrations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-ink-soft">
                    Bu bölümde başvuru bulunmuyor.
                </div>
            ) : (
                <div className="space-y-4">
                    {registrations.map((registration) => (
                        <article
                            key={registration.id}
                            className="rounded-2xl border border-line bg-shell p-6 md:p-7"
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

                                        <span className="text-xs text-ink-soft">
                                            {formatDate(
                                                registration.created_at,
                                            )}
                                        </span>
                                    </div>

                                    <h3 className="mt-5 text-2xl font-semibold">
                                        {registration.full_name}
                                    </h3>

                                    {/* İletişim bilgileri — adın hemen altında,
                                        admin tek bakışta ulaşsın */}
                                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                                        <a
                                            href={`mailto:${registration.email}`}
                                            className="font-semibold text-holly-ink transition-colors hover:underline"
                                            title="E-posta gönder"
                                        >
                                            {registration.email ||
                                                "E-posta belirtilmemiş"}
                                        </a>

                                        {registration.phone ? (
                                            <a
                                                href={`tel:${registration.phone}`}
                                                className="font-semibold text-ink/70 transition-colors hover:text-holly-ink"
                                                title="Telefon etkileşimi başlat"
                                            >
                                                {
                                                    registration.phone
                                                }
                                            </a>
                                        ) : (
                                            <span className="text-ink-soft">
                                                Telefon
                                                belirtilmemiş
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm text-ink-soft">
                                        <p>
                                            <span className="text-ink-soft">
                                                Cinsiyet:
                                            </span>{" "}
                                            <span className="font-semibold text-ink/70">
                                                {registration.gender
                                                    ? genderLabels[
                                                      registration
                                                          .gender
                                                  ] ??
                                                      registration.gender
                                                    : "Belirtilmedi"}
                                            </span>
                                        </p>
                                    </div>

                                    {registration.notes && (
                                        <div className="mt-5 rounded-xl bg-shell p-4">
                                            <span className="text-xs uppercase tracking-wider text-ink-soft">
                                                Katılımcı notu
                                            </span>

                                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-soft">
                                                {registration.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs uppercase tracking-wider text-ink-soft">
                                        Etkinlik
                                    </span>

                                    {registration.event ? (
                                        <>
                                            <h4 className="mt-3 text-xl font-semibold">
                                                {registration.event.title}
                                            </h4>

                                            <p className="mt-3 text-sm text-holly-ink">
                                                {formatDate(
                                                    registration.event
                                                        .starts_at,
                                                )}
                                            </p>

                                            <p className="mt-2 text-sm text-ink-soft">
                                                {
                                                    registration.event
                                                        .location
                                                }
                                            </p>

                                            <p className="mt-4 text-sm text-ink-soft">
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
                                                className="mt-5 inline-flex text-xs font-semibold uppercase tracking-wider text-ink-soft transition-colors hover:text-holly-ink"
                                            >
                                                Etkinliği görüntüle ↗
                                            </Link>
                                        </>
                                    ) : (
                                        <p className="mt-3 text-sm text-red-700">
                                            Etkinlik bilgisi bulunamadı.
                                        </p>
                                    )}
                                </div>

                                <div className="lg:min-w-72">
                                    <span className="mb-4 block text-xs uppercase tracking-wider text-ink-soft">
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
        <main className="min-h-screen bg-white px-6 py-10 text-ink md:px-10 lg:px-16">
            <div className="mx-auto max-w-7xl">
                <header className="flex flex-col justify-between gap-7 border-b border-line pb-9 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                            Etkinlik başvuruları
                        </h1>

                        <p className="mt-4 max-w-2xl leading-7 text-ink-soft">
                            Katılımcı başvurularını incele, onayla, bekleme
                            listesine al veya kalıcı olarak sil.
                        </p>
                    </div>

                    <div className="rounded-full border border-line px-5 py-3 text-sm text-ink-soft">
                        Toplam {registrations.length} başvuru
                    </div>
                </header>

                {error && (
                    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
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