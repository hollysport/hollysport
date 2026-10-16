import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
    getLocalGalleryImages,
} from "@/lib/gallery/get-local-gallery-images";

import EventForm from "@/components/admin/event-form";

export default async function NewEventPage() {
    await requireAdmin();

    const galleryLibraryImages =
        getLocalGalleryImages();

    return (
        <main className="min-h-screen bg-white px-6 py-10 text-ink md:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <header className="border-b border-line pb-9">
                    <Link
                        href="/admin/events"
                        className="text-sm font-semibold uppercase tracking-wider text-ink-soft transition-colors hover:text-holly-ink"
                    >
                        ← Etkinliklere dön
                    </Link>

                    <span className="mt-10 block text-sm font-semibold uppercase tracking-[0.3em] text-holly-ink">
                        Etkinlik Yönetimi
                    </span>

                    <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
                        Yeni etkinlik ekle
                    </h1>

                    <p className="mt-4 max-w-2xl leading-7 text-ink-soft">
                        Etkinlik bilgilerini, yayın
                        durumunu ve görsellerini tek
                        ekrandan yönet.
                    </p>
                </header>

                <EventForm
                    galleryLibraryImages={
                        galleryLibraryImages
                    }
                />
            </div>
        </main>
    );
}