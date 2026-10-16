"use client";

import { useEffect } from "react";

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function ErrorPage({
    error,
    reset,
}: ErrorPageProps) {
    useEffect(() => {
        console.error("Sayfa hatası:", error);
    }, [error]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-white px-6">
            <div className="max-w-md text-center">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-holly-ink">
                    Hata
                </span>

                <h1 className="mt-4 text-3xl font-bold text-ink">
                    Bir şeyler ters gitti
                </h1>

                <p className="mt-4 leading-7 text-ink-soft">
                    Beklenmeyen bir hata oluştu. Lütfen tekrar
                    dene; sorun devam ederse bize iletişim
                    sayfasından ulaşabilirsin.
                </p>

                <button
                    onClick={reset}
                    className="mt-8 flex h-13 w-full items-center justify-center rounded-full bg-holly px-7 text-sm font-semibold uppercase tracking-wider text-ink transition-transform hover:scale-[1.02] hover:bg-[#1fc461]"
                >
                    Tekrar dene
                </button>
            </div>
        </div>
    );
}
