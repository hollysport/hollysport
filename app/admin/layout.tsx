import type { Metadata } from "next";

import AdminShell from "@/components/admin/admin-shell";
import { resolveDisplayName } from "@/lib/auth/display";
import { createClient } from "@/lib/supabase/server";

/*
 * Admin ortak layout'u — kalıcı sol menü.
 *
 * Tüm /admin iç rotaları (login hariç) bu layout üzerinden geçer; böylece
 * yönetim bölümleri arasında gezinirken sol menü yerinde kalır, yalnızca
 * sağdaki içerik değişir. Sidebar her sayfaya ayrı ayrı kopyalanmaz.
 *
 * Güvenlik: bu layout YETKİLENDİRME YAPMAZ. `/admin/login` da bu layout'tan
 * geçtiği için `requireAdmin` burada çağrılamaz (redirect döngüsü olurdu).
 * Her yönetim rotasının kendi `requireAdmin` kontrolü (`lib/auth/require-admin.ts`)
 * sayfada aynen çalışmaya devam eder. Buradaki oturum okuması yalnızca
 * sidebar'da gösterilecek yönetici adı içindir; başarısız olursa menü yine
 * gösterilir (hesap alanı varsayılan ada düşer).
 */

export const metadata: Metadata = {
    title: {
        template: "%s | Holly Sport Yönetim",
        default: "Yönetim Paneli",
    },
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    /*
     * Sidebar hesabı için hafif oturum/profil okuması (yönlendirme yok).
     * Yalnızca rolü admin olan kullanıcıların adı gösterilir.
     */
    let profile: {
        displayName: string | null;
        email: string | null;
    } | null = null;

    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            const { data } = await supabase
                .from("profiles")
                .select("full_name, email, role")
                .eq("id", user.id)
                .maybeSingle();

            if (data && data.role === "admin") {
                profile = {
                    displayName: resolveDisplayName({
                        fullName: data.full_name,
                        email: data.email,
                    }),
                    email: data.email,
                };
            }
        }
    } catch (error) {
        /*
         * Statik prerender denemesi sırasında `cookies()` çağrısı Next.js
         * tarafından kontrollü bir "dynamic server usage" sinyali fırlatır;
         * bu bir hata değil, framework'ün statik render'dan çıkış yoludur.
         * Sinyali yutmayız (yeniden fırlatırız); yalnız gerçek hatalarda
         * log basarız. Hesap bilgisi alınamazsa menü yine çalışır.
         */
        const isDynamicBailout =
            error instanceof Error &&
            (error.message.includes("Dynamic server usage") ||
                (typeof (error as { digest?: unknown }).digest ===
                    "string" &&
                    String(
                        (error as { digest?: unknown }).digest,
                    ).includes("DYNAMIC_SERVER_USAGE")));

        if (isDynamicBailout) {
            throw error;
        }

        console.error(
            "Admin layout profil okuması başarısız:",
            error,
        );
    }

    return (
        <AdminShell profile={profile}>{children}</AdminShell>
    );
}
