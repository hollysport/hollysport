import Link from "next/link";
import { Search, UsersRound } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { resolveDisplayName } from "@/lib/auth/display";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentTimestamp } from "@/lib/time";

type UsersPageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

type ProfileRow = {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    role: string;
    join_date: string | null;
    interested_sports: string[] | null;
};

const MAX_PROFILES = 500;

function formatDate(date: string) {
    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Europe/Istanbul",
    }).format(new Date(date));
}

function getInitial(name: string) {
    return name.trim().charAt(0).toLocaleUpperCase("tr-TR") || "?";
}

/*
 * Admin — üyeler (profiles).
 *
 * Okuma service-role ile yapılır (requireAdmin oturumu doğrular),
 * böylece tabloda SELECT politikası olmasa da liste görünür.
 * Arama `?q=` ile sunucu tarafında filtrelenir (ad veya e-posta).
 */
export default async function AdminUsersPage({
    searchParams,
}: UsersPageProps) {
    await requireAdmin();

    const { q } = await searchParams;
    const query = (q ?? "").trim();

    let rows: ProfileRow[] = [];
    let loadError: string | null = null;

    try {
        const supabaseAdmin = createAdminClient();

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select(
                "id, email, full_name, phone, role, join_date, interested_sports",
            )
            .order("join_date", {
                ascending: false,
                nullsFirst: false,
            })
            .limit(MAX_PROFILES);

        if (error) {
            console.error("AdminUsers: liste okunamadı:", {
                message: error.message,
                code: error.code,
            });

            loadError = `${error.code ?? "?"}: ${error.message}`;
        } else {
            rows = (data ?? []) as unknown as ProfileRow[];
        }
    } catch (clientError) {
        const message =
            clientError instanceof Error
                ? clientError.message
                : String(clientError);

        console.error("AdminUsers: admin client hatası:", { message });
        loadError = message;
    }

    const normalizedQuery = query.toLocaleLowerCase("tr-TR");

    const filteredRows = normalizedQuery
        ? rows.filter((row) => {
              const name = (
                  row.full_name ??
                  row.email ??
                  ""
              ).toLocaleLowerCase("tr-TR");
              const email = (
                  row.email ?? ""
              ).toLocaleLowerCase("tr-TR");

              return (
                  name.includes(normalizedQuery) ||
                  email.includes(normalizedQuery)
              );
          })
        : rows;

    const currentTime = getCurrentTimestamp();
    const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;

    const adminCount = rows.filter((row) => row.role === "admin").length;
    const recentCount = rows.filter((row) => {
        const joined = row.join_date
            ? Date.parse(row.join_date)
            : Number.NaN;

        return !Number.isNaN(joined) && joined >= sevenDaysAgo;
    }).length;

    const stats = [
        {
            label: "Toplam üye",
            value: rows.length,
            accent: false,
        },
        {
            label: "Son 7 günde kayıt",
            value: recentCount,
            accent: true,
        },
        {
            label: "Yönetici",
            value: adminCount,
            accent: false,
        },
    ];

    return (
        <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
                <header className="border-b border-white/10 pb-9">
                    <Link
                        href="/admin"
                        className="text-sm font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
                    >
                        ← Yönetim paneli
                    </Link>

                    <h1 className="mt-7 text-4xl font-bold tracking-tight md:text-5xl">
                        Üyeler
                    </h1>

                    <p className="mt-4 max-w-2xl leading-7 text-white/40">
                        Sisteme kayıt olan kullanıcıları listeleyen
                        üyelik merkezi. İsim veya e-posta ile ara,
                        üyelik tarihini ve ilgi alanlarını gör.
                    </p>
                </header>

                <section className="mt-8 grid gap-4 sm:grid-cols-3">
                    {stats.map((stat) => (
                        <article
                            key={stat.label}
                            className={`rounded-3xl border p-6 ${
                                stat.accent
                                    ? "border-[#27D66B]/25 bg-[#27D66B]/[0.07]"
                                    : "border-white/10 bg-[#111111]"
                            }`}
                        >
                            <span
                                className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                                    stat.accent
                                        ? "text-[#27D66B]"
                                        : "text-white/35"
                                }`}
                            >
                                {stat.label}
                            </span>

                            <strong
                                className={`mt-5 block text-4xl font-bold ${
                                    stat.accent
                                        ? "text-[#27D66B]"
                                        : "text-white"
                                }`}
                            >
                                {stat.value}
                            </strong>
                        </article>
                    ))}
                </section>

                <form
                    method="get"
                    action="/admin/users"
                    className="mt-8 flex flex-wrap items-center gap-3"
                >
                    <label className="relative flex-1 basis-72">
                        <span className="sr-only">Üye ara</span>

                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />

                        <input
                            type="search"
                            name="q"
                            defaultValue={query}
                            placeholder="İsim veya e-posta ile ara"
                            className="min-h-12 w-full rounded-full border border-white/15 bg-[#111111] pl-11 pr-4 text-sm text-white placeholder:text-white/35 transition focus:border-[#27D66B]/60 focus:outline-none"
                        />
                    </label>

                    <button
                        type="submit"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#27D66B] px-6 text-sm font-semibold uppercase tracking-wider text-black transition hover:bg-[#45e27f]"
                    >
                        <Search className="h-4 w-4" />
                        Ara
                    </button>

                    {query && (
                        <Link
                            href="/admin/users"
                            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold uppercase tracking-wider text-white/60 transition hover:border-white/40 hover:text-white"
                        >
                            Temizle
                        </Link>
                    )}
                </form>

                <p className="mt-4 text-sm text-white/40">
                    {query
                        ? `${filteredRows.length} üye "${query}" için listeleniyor.`
                        : `${filteredRows.length} üye listeleniyor.`}
                </p>

                {loadError && (
                    <div
                        role="alert"
                        className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm leading-6 text-red-300"
                    >
                        Üyeler yüklenemedi: {loadError}
                    </div>
                )}

                {!loadError && filteredRows.length === 0 && (
                    <div className="mt-6 rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
                        <UsersRound className="mx-auto h-10 w-10 text-white/20" />

                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/45">
                            {query
                                ? "Aramana uyan üye bulunamadı."
                                : "Henüz kayıtlı üye yok."}
                        </p>
                    </div>
                )}

                {!loadError && filteredRows.length > 0 && (
                    <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredRows.map((row) => {
                            const name = resolveDisplayName({
                                fullName: row.full_name,
                                email: row.email,
                            });

                            const isAdmin = row.role === "admin";
                            const sports = row.interested_sports ?? [];

                            return (
                                <li
                                    key={row.id}
                                    className="rounded-3xl border border-white/10 bg-[#111111] p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#27D66B]/10 text-lg font-bold text-[#27D66B]">
                                            {getInitial(name)}
                                        </span>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2
                                                    title={name}
                                                    className="truncate text-lg font-semibold"
                                                >
                                                    {name}
                                                </h2>

                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                                        isAdmin
                                                            ? "border-[#27D66B]/30 bg-[#27D66B]/15 text-[#27D66B]"
                                                            : "border-white/10 bg-white/5 text-white/55"
                                                    }`}
                                                >
                                                    {isAdmin
                                                        ? "Yönetici"
                                                        : "Üye"}
                                                </span>
                                            </div>

                                            {row.email ? (
                                                <a
                                                    href={`mailto:${row.email}`}
                                                    className="mt-1 block truncate text-sm font-medium text-[#27D66B] transition-colors hover:underline"
                                                >
                                                    {row.email}
                                                </a>
                                            ) : (
                                                <p className="mt-1 text-sm text-white/30">
                                                    E-posta belirtilmemiş
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <dl className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <dt className="shrink-0 text-white/40">
                                                Üyelik tarihi
                                            </dt>

                                            <dd className="text-right text-white/75">
                                                {row.join_date
                                                    ? formatDate(
                                                          row.join_date,
                                                      )
                                                    : "—"}
                                            </dd>
                                        </div>

                                        {row.phone && (
                                            <div className="flex items-start justify-between gap-3">
                                                <dt className="shrink-0 text-white/40">
                                                    Telefon
                                                </dt>

                                                <a
                                                    href={`tel:${row.phone}`}
                                                    className="text-right font-medium text-white/75 transition-colors hover:text-[#27D66B]"
                                                >
                                                    {row.phone}
                                                </a>
                                            </div>
                                        )}
                                    </dl>

                                    {sports.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {sports.map((sport) => (
                                                <span
                                                    key={sport}
                                                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/55"
                                                >
                                                    {sport}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
