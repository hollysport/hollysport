/**
 * Etkinlik başvuru durumları için ortak yardımcı.
 *
 * "Aktif" kayıt: hâlâ geçerli olan başvuru sayılan durumlar.
 * İptal (`cancelled`) veya reddedilmiş (`rejected`) bir kayıt
 * "zaten kayıtlısın" sayılmaz; kullanıcı yeniden başvurabilir.
 */

export const ACTIVE_REGISTRATION_STATUSES = new Set([
    "pending",
    "approved",
    "waitlist",
]);

export function isActiveRegistrationStatus(
    status: string | null | undefined,
): boolean {
    if (!status) return false;

    return ACTIVE_REGISTRATION_STATUSES.has(
        status.trim().toLowerCase(),
    );
}
