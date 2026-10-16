"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/client";

const inputClass =
    "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink-soft/60 focus:border-holly-ink focus:ring-2 focus:ring-holly-ink/20";

const labelClass =
    "text-xs font-semibold uppercase tracking-wider text-ink-soft";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [fieldErrors, setFieldErrors] = useState<
        Record<string, string>
    >({});
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        const errors: Record<string, string> = {};

        if (password.length < 8) {
            errors.password = "Şifre en az 8 karakter olmalıdır.";
        }

        if (passwordConfirm !== password) {
            errors.passwordConfirm = "Şifreler eşleşmiyor.";
        }

        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password,
        });

        setLoading(false);

        if (error) {
            setErrorMessage(
                "Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir; lütfen yeni bir sıfırlama e-postası isteyin.",
            );
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/"), 2000);
    }

    return (
        <>
            <Navbar />

            <main className="flex min-h-screen items-center justify-center bg-shell px-6 py-24 text-ink">
                <div className="w-full max-w-md rounded-3xl border border-line bg-white p-7 shadow-sm sm:p-9">
                    <span className="text-xs font-semibold uppercase tracking-[0.25em] text-holly-ink">
                        Güvenlik
                    </span>

                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                        Yeni Şifre Belirle
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-ink-soft">
                        Hesabın için yeni bir şifre oluştur.
                    </p>

                    {success ? (
                        <div className="mt-8 rounded-2xl border border-holly-ink/30 bg-holly-ink/10 p-8 text-center">
                            <CheckCircle2 className="mx-auto h-10 w-10 text-holly-ink" />
                            <p className="mt-4 text-sm font-semibold leading-6 text-holly-ink">
                                Şifreniz başarıyla güncellendi,
                                yönlendiriliyorsunuz…
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="mt-8 space-y-5"
                        >
                            <label className="block">
                                <span className={labelClass}>
                                    Yeni Şifre
                                </span>
                                <input
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="En az 8 karakter"
                                    className={inputClass}
                                />
                                {fieldErrors.password && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-xs leading-5 text-red-700"
                                    >
                                        {fieldErrors.password}
                                    </p>
                                )}
                            </label>

                            <label className="block">
                                <span className={labelClass}>
                                    Yeni Şifre (Tekrar)
                                </span>
                                <input
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={passwordConfirm}
                                    onChange={(event) =>
                                        setPasswordConfirm(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Şifreni tekrar gir"
                                    className={inputClass}
                                />
                                {fieldErrors.passwordConfirm && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-xs leading-5 text-red-700"
                                    >
                                        {fieldErrors.passwordConfirm}
                                    </p>
                                )}
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-holly text-sm font-bold text-ink transition hover:bg-[#1fc461] disabled:opacity-50"
                            >
                                {loading && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Şifreyi güncelle
                            </button>

                            {errorMessage && (
                                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {errorMessage}
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </>
    );
}
