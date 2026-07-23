import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import EventForm from "@/components/admin/event-form";

export default async function NewEventPage() {
    await requireAdmin();

    return (
        <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <header className="border-b border-white/10 pb-9">
                    <Link
                        href="/admin/events"
                        className="text-sm font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
                    >
                        ← Etkinliklere dön
                    </Link>

                    <span className="mt-10 block text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
                        Etkinlik Yönetimi
                    </span>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
                        Yeni etkinlik ekle
                    </h1>

                    <p className="mt-4 max-w-2xl leading-7 text-white/40">
                        Etkinlik bilgilerini, yayın durumunu ve görsellerini tek ekrandan
                        yönet.
                    </p>
                </header>

                <EventForm />
            </div>
        </main>
    );
}