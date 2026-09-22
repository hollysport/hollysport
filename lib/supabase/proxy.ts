import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    supabaseResponse = NextResponse.next({
                        request,
                    });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    const { data: claimsData } =
        await supabase.auth.getClaims();

    const claims = claimsData?.claims;

    const pathname = request.nextUrl.pathname;

    const isAdminRoute =
        pathname === "/admin" ||
        pathname.startsWith("/admin/");

    const isAdminLoginRoute = pathname === "/admin/login";

    /*
     * Savunma derinliği: /admin/* rotaları sayfa seviyesindeki
     * requireAdmin() kontrolüne ek olarak proxy'de de doğrulanır.
     * /admin/login her durumda erişilebilir kalır.
     */
    if (isAdminRoute && !isAdminLoginRoute) {
        const loginUrl = new URL(
            "/admin/login",
            request.url,
        );

        if (!claims?.sub) {
            return NextResponse.redirect(loginUrl);
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", claims.sub)
            .single();

        if (!profile || profile.role !== "admin") {
            loginUrl.searchParams.set(
                "error",
                "not-admin",
            );

            return NextResponse.redirect(loginUrl);
        }
    }

    return supabaseResponse;
}