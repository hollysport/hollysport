"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const whatsappGroupUrl =
    "https://chat.whatsapp.com/LEHiMPxVmsC7lGB0zvjoJK";

const navigation = [
    {
        label: "Hakkımızda",
        href: "/about",
    },
    {
        label: "Ekibimiz",
        href: "/team",
    },
    {
        label: "Branşlar",
        href: "/sports",
    },
    {
        label: "Etkinlikler",
        href: "/events",
    },
    {
        label: "Galeri",
        href: "/gallery",
    },
    {
        label: "SSS",
        href: "/#faq",
    },
    {
        label: "İletişim",
        href: "/contact",
    },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    function isActive(href: string) {
        if (href.includes("#")) {
            return false;
        }

        return pathname === href;
    }

    return (
        <header className="sticky inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/95 text-white backdrop-blur-xl">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="shrink-0 text-lg font-extrabold tracking-[0.12em] text-white"
                >
                    HOLLY SPORT
                </Link>

                <div className="hidden items-center gap-6 lg:flex">
                    {navigation.map((item) => {
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative py-2 text-sm font-medium transition-colors ${active
                                        ? "text-[#27D66B]"
                                        : "text-white/65 hover:text-white"
                                    }`}
                            >
                                {item.label}

                                {active && (
                                    <span className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-4 rounded-full bg-[#27D66B]" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="hidden items-center gap-3 lg:flex">
                    <a
                        href={whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:border-[#27D66B]/50 hover:bg-white/5 hover:text-[#27D66B]"
                    >
                        Topluluğa Katıl
                    </a>

                    <Link
                        href="/destek-ol"
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#27D66B] px-5 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
                    >
                        Destek Ol
                    </Link>
                </div>

                <button
                    type="button"
                    aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((current) => !current)}
                    className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10 lg:hidden"
                >
                    <span
                        className={`h-0.5 w-5 rounded-full bg-white transition ${isOpen ? "translate-y-2 rotate-45" : ""
                            }`}
                    />

                    <span
                        className={`h-0.5 w-5 rounded-full bg-white transition ${isOpen ? "opacity-0" : ""
                            }`}
                    />

                    <span
                        className={`h-0.5 w-5 rounded-full bg-white transition ${isOpen
                                ? "-translate-y-2 -rotate-45"
                                : ""
                            }`}
                    />
                </button>
            </nav>

            {isOpen && (
                <div className="border-t border-white/10 bg-[#0a0a0a] px-4 pb-6 pt-4 lg:hidden">
                    <div className="mx-auto flex max-w-7xl flex-col rounded-3xl border border-white/10 bg-[#111111] p-5 shadow-2xl">
                        <div className="flex flex-col">
                            {navigation.map((item) => {
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`rounded-2xl px-4 py-3 text-base font-semibold transition ${active
                                                ? "bg-[#27D66B]/10 text-[#27D66B]"
                                                : "text-white/75 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-2">
                            <a
                                href={whatsappGroupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white transition hover:border-[#27D66B]/50 hover:text-[#27D66B]"
                            >
                                Topluluğa Katıl
                            </a>

                            <Link
                                href="/destek-ol"
                                onClick={() => setIsOpen(false)}
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-6 text-sm font-bold text-[#050505]"
                            >
                                Destek Ol
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}