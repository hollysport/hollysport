/**
 * Telefon numarası doğrulaması (kayıt formu + profil düzenleme).
 *
 * Kural: opsiyonel alan — boş bırakılabilir. Doldurulursa
 * - boşluk, tire, parantez ayraçları temizlenir,
 * - isteğe bağlı baştaki `+` kabul edilir,
 * - sonuç 10-15 rakamdan oluşmalıdır (min 10, max 15 karakter).
 */

export const PHONE_INVALID_MESSAGE =
    "Geçerli bir telefon numarası girin (10-15 rakam, isteğe bağlı + ile başlayabilir).";

/** Ayraçları temizler: boşluk, tire, parantez, nokta. */
export function normalizePhone(value: string): string {
    return value.replace(/[\s\-().]/g, "");
}

/** Boşsa geçerli (opsiyonel alan); doluysa format + uzunluk kontrolü. */
export function isValidPhone(value: string): boolean {
    const trimmed = value.trim();

    if (!trimmed) return true;

    return /^\+?\d{10,15}$/.test(normalizePhone(trimmed));
}
