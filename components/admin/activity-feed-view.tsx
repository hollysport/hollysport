import Link from "next/link";
import {
    ArrowUpRight,
    Bell,
    CalendarDays,
    HandHeart,
    HeartHandshake,
    Lightbulb,
    ListChecks,
    MessageCircleQuestion,
    MessageSquareQuote,
    UserRoundPlus,
    UsersRound,
} from "lucide-react";

/*
 * Bildirim (aktivite) akışının GÖRÜNÜM katmanı.
 *
 * Burada yalnızca sunucu ve istemci tarafında ortak kullanılabilen
 * SADE (veri erişimi içermeyen) parçalar bulunur:
 *   - tür listesi ve ikon/renk/hedef eşlemesi
 *   - satır bileşeni
 *
 * Veri erişimi `lib/admin/activity-feed.ts` (sunucu tarafı) içindedir;
 * servis rolü anahtarı istemciye asla sızmaz.
 */

/** Bildirim listesinin sayfa boyutu: ilk 5 kayıt, sonra 5'erli yükleme. */
export const ACTIVITY_PAGE_SIZE = 5;

export type ActivityKind =
    | "program-request"
    | "support-request"
    | "supporter"
    | "new-user"
    | "event"
    | "registration"
    | "question"
    | "dream"
    | "review";

export type ActivityItem = {
    key: string;
    kind: ActivityKind;
    title: string;
    person: string;
    detail: string;
    href: string;
    createdAt: string;
    /** Sunucuda üretilmiş göreli zaman ("2 saat önce"). */
    timeLabel: string;
    pending: boolean;
    /** İşlemi yapan yönetici (varsa ve sistemde kayıtlıysa). */
    actor?: string | null;
};

export const ACTIVITY_META: Record<
    ActivityKind,
    { icon: typeof Bell; iconClass: string; href: string }
> = {
    "program-request": {
        icon: ListChecks,
        iconClass: "bg-[#E6F2FB] text-[#0369A1]",
        href: "/admin/custom-training-requests",
    },
    "support-request": {
        icon: HandHeart,
        iconClass: "bg-[#E8F9EE] text-[#0E7C3D]",
        href: "/admin/support-requests",
    },
    supporter: {
        icon: HeartHandshake,
        iconClass: "bg-[#FEF6E0] text-[#A16207]",
        href: "/admin/supporters",
    },
    "new-user": {
        icon: UserRoundPlus,
        iconClass: "bg-[#F1ECFD] text-[#6D28D9]",
        href: "/admin/users",
    },
    event: {
        icon: CalendarDays,
        iconClass: "bg-[#E8F9EE] text-[#0E7C3D]",
        href: "/admin/events",
    },
    registration: {
        icon: UsersRound,
        iconClass: "bg-[#E6F2FB] text-[#0369A1]",
        href: "/admin/registrations",
    },
    question: {
        icon: MessageCircleQuestion,
        iconClass: "bg-[#F1ECFD] text-[#6D28D9]",
        href: "/admin/questions",
    },
    dream: {
        icon: Lightbulb,
        iconClass: "bg-[#F1ECFD] text-[#6D28D9]",
        href: "/admin/dreams",
    },
    review: {
        icon: MessageSquareQuote,
        iconClass: "bg-[#FEF6E0] text-[#A16207]",
        href: "/admin/reviews",
    },
};

/** Boş durum ikonu. */
export function ActivityFeedEmptyIcon() {
    return <Bell aria-hidden="true" className="h-6 w-6" />;
}

export function ActivityFeedRow({ item }: { item: ActivityItem }) {
    const meta = ACTIVITY_META[item.kind];
    const Icon = meta.icon;

    return (
        <Link
            href={item.href}
            className="group flex items-start gap-3 rounded-2xl border border-[#E5E8E3] bg-white p-4 transition hover:border-[#bfe8cf] hover:bg-[#F7F8F6] sm:gap-4 sm:p-5"
        >
            <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.iconClass}`}
            >
                <Icon className="h-5 w-5" />
            </span>

            <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#171917] sm:text-base">
                        {item.title}
                    </span>

                    {item.pending && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                            Bekliyor
                        </span>
                    )}
                </span>

                <span className="mt-1 block truncate text-sm text-[#626862]">
                    <span className="font-semibold text-[#171917]">
                        {item.person}
                    </span>
                    {item.detail ? ` — ${item.detail}` : ""}
                </span>

                {item.actor && (
                    <span className="mt-1 block truncate text-xs text-[#626862]">
                        İşlemi yapan: {item.actor}
                    </span>
                )}

                <span className="mt-1.5 block text-xs text-[#626862]">
                    {item.timeLabel}
                </span>
            </span>

            <span className="mt-1 hidden shrink-0 items-center gap-1 rounded-full border border-[#E5E8E3] px-3 py-1.5 text-xs font-semibold text-[#626862] transition group-hover:border-[#0E7C3D] group-hover:text-[#0E7C3D] sm:inline-flex">
                Detay
                <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
        </Link>
    );
}
