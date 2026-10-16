import { resolveDisplayName } from "@/lib/auth/display";
import { GOALS } from "@/lib/data/exercises";
import { createAdminClient } from "@/lib/supabase/admin";

import {
    ACTIVITY_PAGE_SIZE,
    type ActivityItem,
} from "@/components/admin/activity-feed-view";

export { ACTIVITY_PAGE_SIZE };

/*
 * Bildirim Merkezi — veri katmanı (SUNUCU TARAFI).
 *
 * Aktivite akışı mevcut kaynak tablolardan "türetilir": bir kayıt
 * varsa işlem gerçekten başarılı olmuştur. Bu yaklaşımın üç sonucu:
 *   1) Başarısız bir işlem için asla bildirim üretilmez.
 *   2) Aynı işlem için iki farklı yerde bildirim yazılamaz (mükerrer yok).
 *   3) Okuma service-role ile yapılır; `requireAdmin` oturumu doğrular ve
 *      RLS'te SELECT politikası olmayan tablolar (ör. custom_program_requests)
 *      bu sayede görünür kalır.
 *
 * Sınırlama: kalıcı bir bildirim/journal tablosu olmadığı için işlem geçmişi
 * (ör. "etkinlik silindi") saklanamaz; yalnızca kaynak tablolardan
 * türetilebilen değişiklikler akışa düşer. Ayrıntı: PROJECT_STATUS.md.
 */

type AdminClient = ReturnType<typeof createAdminClient>;

export type ActivityFeedResult = {
    items: ActivityItem[];
    hasMore: boolean;
    pendingProgramCount: number;
    loadError: string | null;
};

const SUPPORT_STATUS_LABELS: Record<string, string> = {
    pending: "Bekliyor",
    contacted: "İletişime geçildi",
    approved: "Onaylandı",
    rejected: "Reddedildi",
};

const SUPPORTER_CATEGORY_LABELS: Record<string, string> = {
    individual: "Bireysel destekçi",
    volunteer: "Gönüllü destekçi",
    angel_investor: "Stratejik yatırımcı",
};

const REGISTRATION_STATUS_LABELS: Record<string, string> = {
    pending: "Bekliyor",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    cancelled: "İptal edildi",
};

const EVENT_STATUS_LABELS: Record<string, string> = {
    published: "Yayında",
    draft: "Taslak",
    archived: "Arşivde",
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
    pending: "Onay bekliyor",
    approved: "Yayında",
    rejected: "Reddedildi",
};

const RELATIVE_TIME_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["second", 1000],
    ["minute", 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["week", 7 * 24 * 60 * 60 * 1000],
    ["month", 30 * 24 * 60 * 60 * 1000],
    ["year", 365 * 24 * 60 * 60 * 1000],
];

/** "2026-09-29T10:00:00Z" -> "2 saat önce" (tr-TR). Geçersiz tarih "" döner. */
export function formatRelativeTime(date: string, now: number): string {
    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
        return "";
    }

    const elapsed = timestamp - now;
    let unit: Intl.RelativeTimeFormatUnit = "second";
    let divisor = 1000;

    for (const [nextUnit, nextDivisor] of RELATIVE_TIME_UNITS) {
        if (Math.abs(elapsed) >= nextDivisor) {
            unit = nextUnit;
            divisor = nextDivisor;
        }
    }

    return new Intl.RelativeTimeFormat("tr", { numeric: "auto" }).format(
        Math.round(elapsed / divisor),
        unit,
    );
}

/** Bir kaydın "şimdi" etiketini üretir; tarih okunamazsa "" döner. */
function timeLabelOf(createdAt: string, now: number): string {
    return formatRelativeTime(createdAt, now);
}

type ProgramRequestRow = {
    id: string;
    full_name: string;
    goal?: string;
    status?: string;
    created_at: string;
};

/*
 * `custom_program_requests` son talepleri.
 * `status` kolonu henüz eklenmemişse (PGRST204) sorgu kolonsuz
 * tekrarlanır — /admin/custom-training-requests ile aynı desen.
 */
async function fetchProgramRequests(
    admin: AdminClient,
    limit: number,
): Promise<ProgramRequestRow[]> {
    const run = async (select: string, filterPending: boolean) => {
        let query = admin
            .from("custom_program_requests")
            .select(select)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (filterPending) {
            query = query.eq("status", "pending");
        }

        return await query;
    };

    const { data, error } = await run(
        "id, full_name, goal, status, created_at",
        true,
    );

    if (error?.code === "PGRST204") {
        const fallback = await run(
            "id, full_name, goal, created_at",
            false,
        );

        if (fallback.error) {
            console.error(
                "Bildirim Merkezi: özel antrenman talepleri okunamadı:",
                {
                    message: fallback.error.message,
                    code: fallback.error.code,
                },
            );

            return [];
        }

        return (fallback.data ?? []) as unknown as ProgramRequestRow[];
    }

    if (error) {
        console.error("Bildirim Merkezi: özel antrenman talepleri okunamadı:", {
            message: error.message,
            code: error.code,
        });

        return [];
    }

    return (data ?? []) as unknown as ProgramRequestRow[];
}

type EventRow = {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    created_by: string | null;
    updated_by: string | null;
};

export async function fetchActivityFeed({
    offset,
    limit,
}: {
    offset: number;
    limit: number;
}): Promise<ActivityFeedResult> {
    let admin: AdminClient;

    try {
        admin = createAdminClient();
    } catch (clientError) {
        const message =
            clientError instanceof Error
                ? clientError.message
                : String(clientError);

        console.error("Bildirim Merkezi: admin istemcisi oluşturulamadı:", {
            message,
        });

        return {
            items: [],
            hasMore: false,
            pendingProgramCount: 0,
            loadError: message,
        };
    }

    /*
     * Sayfalama: her kaynaktan `offset + limit + 1` satır çekilir, tek zaman
     * akışında birleştirilir ve dilimlenir. Böylece "Daha fazla göster"
     * istekleri veritabanında karşılanır; tüm tablo istemciye inmez.
     */
    const windowSize = Math.max(offset + limit + 1, limit + 1);

    const [
        programRows,
        supportRequests,
        supporters,
        newUsers,
        events,
        registrations,
        questions,
        dreams,
        reviews,
        pendingProgramCountResult,
    ] = await Promise.all([
        fetchProgramRequests(admin, windowSize),

        admin
            .from("support_requests")
            .select("id, full_name, status, created_at")
            .order("created_at", { ascending: false })
            .limit(windowSize),

        admin
            .from("individual_supporters")
            .select("id, display_name, supporter_category, created_at")
            .order("created_at", { ascending: false })
            .limit(windowSize),

        admin
            .from("profiles")
            .select("id, full_name, email, join_date")
            .order("join_date", { ascending: false, nullsFirst: false })
            .limit(windowSize),

        admin
            .from("events")
            .select(
                "id, title, status, created_at, updated_at, published_at, created_by, updated_by",
            )
            .order("updated_at", { ascending: false, nullsFirst: false })
            .limit(windowSize),

        admin
            .from("event_registrations")
            .select("id, full_name, status, created_at")
            .order("created_at", { ascending: false })
            .limit(windowSize),

        admin
            .from("contact_questions")
            .select("id, full_name, subject, status, created_at")
            .order("created_at", { ascending: false })
            .limit(windowSize),

        admin
            .from("dream_submissions")
            .select("id, full_name, dream_title, status, created_at")
            .order("created_at", { ascending: false })
            .limit(windowSize),

        admin
            .from("community_reviews")
            .select("id, full_name, status, approved_at, created_at")
            .order("created_at", { ascending: false })
            .limit(windowSize),

        admin
            .from("custom_program_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
    ]);

    const reportSourceError = (
        label: string,
        error: { message: string; code?: string } | null,
    ) => {
        if (error) {
            console.error(`Bildirim Merkezi: ${label} okunamadı:`, {
                message: error.message,
                code: error.code,
            });
        }
    };

    reportSourceError("destek başvuruları", supportRequests.error);
    reportSourceError("destekçiler", supporters.error);
    reportSourceError("yeni kullanıcılar", newUsers.error);
    reportSourceError("etkinlikler", events.error);
    reportSourceError("etkinlik başvuruları", registrations.error);
    reportSourceError("sorular", questions.error);
    reportSourceError("hayal başvuruları", dreams.error);
    reportSourceError("topluluk görüşleri", reviews.error);

    const now = Date.now();
    const items: ActivityItem[] = [];

    const seenKeys = new Set<string>();
    const push = (item: Omit<ActivityItem, "timeLabel">) => {
        if (seenKeys.has(item.key)) {
            return;
        }

        seenKeys.add(item.key);
        items.push({
            ...item,
            timeLabel: timeLabelOf(item.createdAt, now),
        });
    };

    for (const row of programRows) {
        push({
            key: `program-${row.id}`,
            kind: "program-request",
            title: "Yeni Özel Antrenman Talebi",
            person: row.full_name,
            detail: row.goal
                ? (GOALS.find((goal) => goal.key === row.goal)?.label ??
                  row.goal)
                : "Hedef belirtilmedi",
            href: "/admin/custom-training-requests",
            createdAt: row.created_at,
            pending: (row.status ?? "pending") === "pending",
        });
    }

    for (const row of supportRequests.data ?? []) {
        push({
            key: `support-${row.id}`,
            kind: "support-request",
            title: "Yeni Destek Başvurusu",
            person: row.full_name,
            detail: SUPPORT_STATUS_LABELS[row.status] ?? row.status,
            href: "/admin/support-requests",
            createdAt: row.created_at,
            pending: row.status === "pending",
        });
    }

    for (const row of supporters.data ?? []) {
        push({
            key: `supporter-${row.id}`,
            kind: "supporter",
            title: "Yeni Destekçi / Yatırımcı",
            person: row.display_name,
            detail:
                SUPPORTER_CATEGORY_LABELS[row.supporter_category] ??
                row.supporter_category,
            href: "/admin/supporters",
            createdAt: row.created_at,
            pending: false,
        });
    }

    for (const row of newUsers.data ?? []) {
        push({
            key: `user-${row.id}`,
            kind: "new-user",
            title: "Yeni Kullanıcı Kaydı",
            person: resolveDisplayName({
                fullName: row.full_name,
                email: row.email,
            }),
            detail: row.email ?? "E-posta belirtilmedi",
            href: "/admin/users",
            createdAt: row.join_date ?? "",
            pending: false,
        });
    }

    /*
     * Etkinlikler: oluşturma, düzenleme ve yayınlama aynı satırda
     * "son değişiklik" olarak izlenir (created_at / updated_at /
     * published_at mevcut tablodan türetilir).
     */
    const eventRows = (events.data ?? []) as unknown as EventRow[];
    const actorIds = Array.from(
        new Set(
            eventRows
                .map((row) => row.updated_by ?? row.created_by)
                .filter((id): id is string => Boolean(id)),
        ),
    );

    let actorNames = new Map<string, string>();

    if (actorIds.length > 0) {
        const { data: actorRows } = await admin
            .from("profiles")
            .select("id, full_name, email")
            .in("id", actorIds);

        actorNames = new Map(
            (actorRows ?? []).map((row: {
                id: string;
                full_name: string | null;
                email: string | null;
            }) => [
                row.id,
                resolveDisplayName({
                    fullName: row.full_name,
                    email: row.email,
                }),
            ]),
        );
    }

    for (const row of eventRows) {
        const createdAt = Date.parse(row.created_at) || 0;
        const updatedAt = Date.parse(row.updated_at) || 0;
        const publishedAt = row.published_at
            ? Date.parse(row.published_at)
            : 0;

        const changedAt = Math.max(createdAt, updatedAt, publishedAt);
        const wasEdited = updatedAt > createdAt;
        const actorId = row.updated_by ?? row.created_by;

        push({
            key: `event-${row.id}`,
            kind: "event",
            title: wasEdited ? "Etkinlik Güncellendi" : "Etkinlik Oluşturuldu",
            person: row.title,
            detail: EVENT_STATUS_LABELS[row.status] ?? row.status,
            href: "/admin/events",
            createdAt:
                changedAt > 0 ? new Date(changedAt).toISOString() : row.created_at,
            pending: row.status !== "published",
            actor: actorId ? actorNames.get(actorId) ?? null : null,
        });
    }

    for (const row of registrations.data ?? []) {
        push({
            key: `registration-${row.id}`,
            kind: "registration",
            title: "Yeni Etkinlik Başvurusu",
            person: row.full_name,
            detail: REGISTRATION_STATUS_LABELS[row.status] ?? row.status,
            href: "/admin/registrations",
            createdAt: row.created_at,
            pending: row.status === "pending",
        });
    }

    for (const row of questions.data ?? []) {
        push({
            key: `question-${row.id}`,
            kind: "question",
            title: "Yeni Soru Geldi",
            person: row.full_name,
            detail: row.subject,
            href: "/admin/questions",
            createdAt: row.created_at,
            pending: row.status === "pending",
        });
    }

    for (const row of dreams.data ?? []) {
        push({
            key: `dream-${row.id}`,
            kind: "dream",
            title: "Yeni Hayal Başvurusu",
            person: row.full_name,
            detail: row.dream_title,
            href: "/admin/dreams",
            createdAt: row.created_at,
            pending: (row.status ?? "new") === "new",
        });
    }

    for (const row of reviews.data ?? []) {
        push({
            key: `review-${row.id}`,
            kind: "review",
            title: "Yeni Topluluk Görüşü",
            person: row.full_name,
            detail: REVIEW_STATUS_LABELS[row.status] ?? row.status,
            href: "/admin/reviews",
            createdAt: row.created_at,
            pending: row.status === "pending",
        });
    }

    /* En yeni en üstte; tarihi okunamayanlar en sona düşer, kararlı sıralama. */
    items.sort((a, b) => {
        const aTime = Date.parse(a.createdAt) || 0;
        const bTime = Date.parse(b.createdAt) || 0;

        if (bTime !== aTime) {
            return bTime - aTime;
        }

        return a.key.localeCompare(b.key);
    });

    const page = items.slice(offset, offset + limit);

    const pendingProgramCount = pendingProgramCountResult.error
        ? programRows.filter((row) => (row.status ?? "pending") === "pending")
              .length
        : (pendingProgramCountResult.count ?? 0);

    return {
        items: page,
        hasMore: items.length > offset + limit,
        pendingProgramCount,
        loadError: null,
    };
}
