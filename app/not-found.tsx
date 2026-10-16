import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-white px-6">
            <div className="max-w-md text-center">
                <span className="text-sm font-semibold uppercase tracking-[0.25em] text-holly-ink">
                    404
                </span>

                <h1 className="mt-4 text-3xl font-bold text-ink">
                    Sayfa bulunamadı
                </h1>

                <p className="mt-4 leading-7 text-ink-soft">
                    Aradığın sayfa taşınmış ya da hiç var olmamış
                    olabilir.
                </p>

                <Link
                    href="/"
                    className="mt-8 flex h-13 items-center justify-center rounded-full bg-holly px-7 text-sm font-semibold uppercase tracking-wider text-ink transition-transform hover:scale-[1.02] hover:bg-[#1fc461]"
                >
                    Anasayfaya dön
                </Link>
            </div>
        </div>
    );
}
