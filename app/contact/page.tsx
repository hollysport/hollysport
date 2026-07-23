import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowUpRight,
    CircleHelp,
    HandHeart,
    MessageCircle,
    Users,
} from "lucide-react";

import QuestionForm from "@/components/contact/QuestionForm";

export const metadata: Metadata = {
    title: "İletişim | Holly Sport",
    description:
        "Holly Sport hakkında sorularını, etkinlik taleplerini ve iş birliği önerilerini bizimle paylaş.",
};

const contactOptions = [
    {
        title: "Sıkça Sorulan Sorular",
        description:
            "Etkinlikler, katılım ve topluluk hakkında sık sorulan cevapları incele.",
        href: "/faq",
        linkText: "Soruları incele",
        icon: CircleHelp,
        external: false,
    },
    {
        title: "Topluluğa Katıl",
        description:
            "WhatsApp topluluğumuza katıl ve yaklaşan etkinliklerden haberdar ol.",
        href: "https://chat.whatsapp.com/LEHiMPxVmsC7lGB0zvjoJK",
        linkText: "WhatsApp topluluğuna katıl",
        icon: Users,
        external: true,
    },
    {
        title: "Destek Ol",
        description:
            "Bireysel veya kurumsal desteğinle topluluğun büyümesine katkı sağla.",
        href: "/destek-ol",
        linkText: "Destek seçenekleri",
        icon: HandHeart,
        external: false,
    },
];

export default function ContactPage() {
    return (
        <main className="bg-[#050505] text-white">
            <section className="border-b border-white/10 px-6 py-20 sm:py-28 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#27D66B]">
                        İletişim
                    </p>

                    <h1 className="mt-5 max-w-5xl text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                        Sorularını ve fikirlerini bizimle paylaş.
                    </h1>

                    <p className="mt-6 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
                        Etkinlikler, topluluğa katılım, gönüllülük, destek ve kurumsal
                        iş birlikleri hakkında bize ulaşabilirsin.
                    </p>
                </div>
            </section>

            <section className="px-6 py-16 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
                    {contactOptions.map((option) => {
                        const Icon = option.icon;

                        const cardContent = (
                            <>
                                <div>
                                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B]">
                                        {option.external ? (
                                            <svg
                                                aria-hidden="true"
                                                viewBox="0 0 32 32"
                                                className="h-7 w-7 fill-current"
                                            >
                                                <path d="M16.04 3C8.86 3 3.02 8.8 3.02 15.94c0 2.28.6 4.51 1.74 6.47L3 29l6.77-1.75a13.07 13.07 0 0 0 6.26 1.59h.01c7.17 0 13.01-5.81 13.01-12.95C29.05 8.8 23.21 3 16.04 3Zm0 23.66h-.01a10.86 10.86 0 0 1-5.53-1.51l-.4-.24-4.02 1.04 1.07-3.9-.26-.4a10.72 10.72 0 0 1-1.67-5.71c0-5.94 4.85-10.77 10.82-10.77 5.96 0 10.81 4.83 10.81 10.77 0 5.95-4.85 10.72-10.81 10.72Zm5.93-8.07c-.32-.16-1.92-.94-2.22-1.05-.3-.11-.52-.16-.74.16-.21.32-.84 1.05-1.03 1.27-.19.21-.38.24-.7.08-.33-.16-1.38-.5-2.62-1.61a9.87 9.87 0 0 1-1.82-2.25c-.19-.32-.02-.5.14-.66.15-.14.33-.37.49-.56.16-.18.22-.32.33-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.75-1.01-2.39-.26-.63-.53-.54-.74-.55h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.11-1.14 2.71 0 1.59 1.17 3.13 1.33 3.35.16.21 2.3 3.5 5.57 4.91.78.33 1.39.53 1.86.68.78.25 1.49.21 2.05.13.63-.09 1.92-.78 2.19-1.54.27-.75.27-1.39.19-1.53-.08-.13-.3-.21-.62-.37Z" />
                                            </svg>
                                        ) : (
                                            <Icon className="h-6 w-6" />
                                        )}
                                    </div>

                                    <h2 className="mt-7 text-2xl font-bold">
                                        {option.title}
                                    </h2>

                                    <p className="mt-3 text-sm leading-7 text-white/45">
                                        {option.description}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-[#27D66B]">
                                        {option.linkText}
                                    </span>

                                    <ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:text-[#27D66B]" />
                                </div>
                            </>
                        );

                        const cardClassName =
                            "group flex min-h-64 flex-col justify-between rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:border-[#27D66B]/40";

                        return option.external ? (
                            <a
                                key={option.href}
                                href={option.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cardClassName}
                            >
                                {cardContent}
                            </a>
                        ) : (
                            <Link
                                key={option.href}
                                href={option.href}
                                className={cardClassName}
                            >
                                {cardContent}
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="px-6 pb-20 pt-6 sm:pb-28 lg:px-8">
                <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] lg:grid-cols-[0.75fr_1.25fr]">
                    <div className="border-b border-white/10 bg-[#27D66B] p-8 text-black sm:p-10 lg:border-b-0 lg:border-r">
                        <MessageCircle className="h-10 w-10" />

                        <h2 className="mt-8 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                            Bize mesaj gönder.
                        </h2>

                        <p className="mt-5 max-w-md text-sm leading-7 text-black/65">
                            Formu doldurduğunda mesajın doğrudan Holly Sport yönetim
                            ekibine ulaşır. En kısa sürede verdiğin iletişim bilgileri
                            üzerinden dönüş yapılır.
                        </p>

                        <div className="mt-10 rounded-2xl border border-black/10 bg-black/5 p-5">
                            <p className="text-sm font-bold">
                                Mesaj göndermeden önce
                            </p>

                            <p className="mt-2 text-sm leading-6 text-black/60">
                                E-posta ve telefon bilgilerini doğru yazdığından emin ol.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-10">
                        <QuestionForm />
                    </div>
                </div>
            </section>
        </main>
    );
}