/*
 * Üyelik süresi (rozet) hesabı.
 *
 * Kaynak önceliği: profiles.join_date -> user_metadata.join_date
 * (kayıt anında her ikisine de yazılır). `join_date` yoksa veya
 * gelecekteyse rozet "Yeni Üye"; geçmiş varsa ay/yıl bazında
 * dinamik metin üretilir.
 */

type MetadataLike = Record<string, unknown> | null | undefined;

function firstText(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return null;
}

/** Geçerli bir tarih döndürür; aksi halde null. */
function toDate(value: string): Date | null {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date;
}

/*
 * Üyelik başlangıç tarihini çöz: profiles.join_date yoksa
 * auth.user_metadata.join_date'e düşer.
 */
export function resolveJoinDate({
    joinDate,
    metadata,
}: {
    joinDate?: string | null;
    metadata?: MetadataLike;
}): string | null {
    const candidate = firstText(
        joinDate,
        metadata?.join_date,
    );

    if (!candidate) return null;

    return toDate(candidate) ? candidate : null;
}

/** İki tarih arasındaki tam ay farkı (bugün - başlangıç). */
export function monthsSince(dateValue: string): number | null {
    const start = toDate(dateValue);

    if (!start) return null;

    const now = Date.now();

    // Gelecekteki tarih geçerli süre sayılmaz
    if (start.getTime() > now) return null;

    const days = (now - start.getTime()) / (1000 * 60 * 60 * 24);

    return Math.floor(days / 30.44);
}

const MONTHS_IN_YEAR = 12;

/*
 * Ay farkına göre dinamik rozet metni.
 *
 *  < 1 ay  -> "Yeni Üye" (tarih yok / çok yeni / gelecekte)
 *  1-3     -> "1-3 Aylık Üye"
 *  3-6     -> "3-6 Aylık Üye"
 *  6-12    -> "6-12 Aylık Üye"
 *  12-18   -> "1 Yıllık Üye"
 *  18-24   -> "1-2 Yıllık Üye"
 *  24+     -> "N Yıllık Üye" (ör. "3 Yıllık Üye", "5+ Yıllık Üye")
 */
export function membershipLabel(
    joinDate: string | null | undefined,
): string {
    if (!joinDate) return "Yeni Üye";

    const months = monthsSince(joinDate);

    if (months === null || months < 1) return "Yeni Üye";
    if (months < 3) return "1-3 Aylık Üye";
    if (months < 6) return "3-6 Aylık Üye";
    if (months < 12) return "6-12 Aylık Üye";
    if (months < 18) return "1 Yıllık Üye";
    if (months < 24) return "1-2 Yıllık Üye";

    const years = Math.floor(months / MONTHS_IN_YEAR);

    return years >= 10 ? "10+ Yıllık Üye" : `${years} Yıllık Üye`;
}

/*
 * Profil bileşenleri için tek çağrı: join_date'i metadata yedeğiyle
 * çözer ve rozet metnini üretir.
 */
export function membershipBadge({
    joinDate,
    metadata,
}: {
    joinDate?: string | null;
    metadata?: MetadataLike;
}): string {
    return membershipLabel(
        resolveJoinDate({ joinDate, metadata }),
    );
}
