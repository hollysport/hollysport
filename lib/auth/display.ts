/*
 * Ön yüzde kullanıcı kimliği okuma yardımcıları.
 *
 * Kayıt (signUp / createUser) sırasında isim hem `profiles.full_name`
 * hem `user_metadata.full_name`, avatar hem `profiles.avatar_url`
 * hem `user_metadata.avatar_url` / `user_metadata.avatar` altına
 * yazılır. Bileşenler bu kaynakların hepsini sırayla dener; hiçbir
 * yerde "İsimsiz üye" veya hatalı varsayılan görünmez.
 *
 * Not: Modül bilinçli olarak `server-only` DEĞİLDİR — hem RSC
 * (admin paneli) hem istemci bileşenleri (Navbar, profil paneli)
 * tarafından kullanılabilir.
 */

import { normalizeAvatarKey } from "@/components/auth/avatar-selector";

type MetadataLike = Record<string, unknown> | null | undefined;

/** Dizge olup boş olmayan ilk değeri döner. */
function firstText(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }

    return null;
}

/** "ornek@mail.com" -> "ornek" (asla boş kalmaz). */
export function emailPrefix(email?: string | null): string | null {
    if (typeof email !== "string") return null;

    const prefix = email.split("@")[0]?.trim();

    return prefix || null;
}

type DisplayNameInput = {
    fullName?: string | null;
    email?: string | null;
    metadata?: MetadataLike;
};

/*
 * Görünen ad: profiles.full_name -> user_metadata.full_name ->
 * user_metadata.name -> e-posta ön eki. Son çare bile e-posta
 * ön eki olduğu için "İsimsiz üye" hiçbir koşulda basılmaz.
 */
export function resolveDisplayName({
    fullName,
    email,
    metadata,
}: DisplayNameInput): string {
    return (
        firstText(
            fullName,
            metadata?.full_name,
            metadata?.name,
            emailPrefix(email),
        ) ?? "Üye"
    );
}

type AvatarKeyInput = {
    avatarUrl?: string | null;
    metadata?: MetadataLike;
};

/*
 * Görünen avatar anahtarı: profiles.avatar_url ->
 * user_metadata.avatar_url -> user_metadata.avatar. Değer anahtar,
 * ikon adı veya kısa bir URL olabilir; normalizeAvatarKey hepsini
 * preset anahtarına çevirir. Yalnızca hiçbir kaynakta değer yoksa
 * null döner (bileşen varsayılan ikona düşer).
 */
export function resolveAvatarKey({
    avatarUrl,
    metadata,
}: AvatarKeyInput): string | null {
    return normalizeAvatarKey(
        firstText(
            avatarUrl,
            metadata?.avatar_url,
            metadata?.avatar,
        ),
    );
}
