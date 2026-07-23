import Link from "next/link";
import { login } from "./actions";

type AdminLoginPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};

const errorMessages: Record<string, string> = {
    "missing-fields": "E-posta ve şifre alanlarını doldur.",
    "invalid-credentials": "E-posta adresi veya şifre hatalı.",
    "not-admin": "Bu hesabın admin yetkisi bulunmuyor.",
};

export default async function AdminLoginPage({
    searchParams,
}: AdminLoginPageProps) {
    const { error } = await searchParams;
    const errorMessage = error ? errorMessages[error] : null;

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 py-16 text-white">
            <div className="w-full max-w-md">
                <Link
                    href="/"
                    className="mb-10 inline-block text-sm font-semibold uppercase tracking-wider text-white/45 transition-colors hover:text-[#27D66B]"
                >
                    ← Siteye dön
                </Link>

                <div className="rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-10">
                    <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                        Holly Sport
                    </span>

                    <h1 className="mt-5 text-4xl font-bold tracking-tight">
                        Admin girişi
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-white/45">
                        Etkinlikleri ve başvuruları yönetmek için giriş yap.
                    </p>

                    {errorMessage && (
                        <div className="mt-7 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {errorMessage}
                        </div>
                    )}

                    <form action={login} className="mt-8 space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm text-white/60"
                            >
                                E-posta
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="admin@hollysport.com"
                                className="h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 outline-none transition-colors placeholder:text-white/20 focus:border-[#27D66B]"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm text-white/60"
                            >
                                Şifre
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className="h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 outline-none transition-colors placeholder:text-white/20 focus:border-[#27D66B]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex h-14 w-full items-center justify-center rounded-full bg-[#27D66B] text-sm font-semibold uppercase tracking-wider text-black transition-transform hover:scale-[1.02]"
                        >
                            Giriş yap
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs leading-5 text-white/25">
                        Bu alan yalnızca yetkili Holly Sport yöneticileri içindir.
                    </p>
                </div>
            </div>
        </main>
    );
}