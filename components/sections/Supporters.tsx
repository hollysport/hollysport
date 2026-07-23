
import Link from "next/link";
import { ArrowRight, HandHeart } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import SupporterTicker from "@/components/support/SupporterTicker";

const fiftyDaysAgo = new Date();
fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);
const sponsorCategoryLabels: Record<string, string> = {
    main_sponsor: "Ana Destekçi",
    official_supporter: "Resmî Destekçi",
    event_supporter: "Etkinlik Destekçisi",
    venue_supporter: "Mekân Destekçisi",
    equipment_supporter: "Ekipman Destekçisi",
    solution_partner: "Çözüm Ortağı",
};

type Sponsor = {
    id: string;
    name: string;
    logo_path: string;
    website: string | null;
    category: string;
};

type IndividualSupporter = {
    id: string;
    display_name: string;
    supporter_category: string;
};

export default async function Supporters() {
    const supabase = await createClient();

    const [sponsorsResult, supportersResult] = await Promise.all([
        supabase
            .from("sponsors")
            .select("id, name, logo_path, website, category")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),

        supabase
            .from("individual_supporters")
            .select("id, display_name, supporter_category, created_at")
            .eq("is_active", true)
            .eq("supporter_category", "angel_investor")
            .gte("created_at", fiftyDaysAgo.toISOString())
            .order("sort_order", { ascending: true }),
    ]);

    const sponsors = (sponsorsResult.data ?? []) as Sponsor[];

    const supporters =
        (supportersResult.data ?? []) as IndividualSupporter[];

    const investorNames = supporters.map(
        (supporter) => supporter.display_name,
    );

    return (
        <section className="bg-zinc-950 py-20 text-white sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                        <HandHeart className="h-6 w-6" />
                    </div>

                    <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                        Destekçilerimiz
                    </p>

                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
                        Holly Sport birlikte büyüyor.
                    </h2>

                    <p className="mt-5 max-w-2xl leading-7 text-zinc-400 sm:text-lg">
                        Emeği, uzmanlığı, ürünleri ve desteğiyle topluluğumuza güç
                        veren kişi ve kurumlara teşekkür ederiz.
                    </p>
                </div>

                <div className="mt-14">
                    <div className="flex items-end justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                                Kurumsal
                            </p>

                            <h3 className="mt-2 text-2xl font-bold">
                                Resmî Destekçiler ve İş Ortakları
                            </h3>
                        </div>
                    </div>

                    {sponsors.length > 0 ? (
                        <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {sponsors.map((sponsor) => {
                                const content = (
                                    <>
                                        <div className="flex h-16 w-full items-center justify-center">
                                            <img
                                                src={sponsor.logo_path}
                                                alt={`${sponsor.name} logosu`}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>

                                        <div className="mt-5 text-center">
                                            <p className="font-semibold text-zinc-950">
                                                {sponsor.name}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                {sponsorCategoryLabels[sponsor.category] ??
                                                    "Destekçi"}
                                            </p>
                                        </div>
                                    </>
                                );

                                if (sponsor.website) {
                                    return (
                                        <a
                                            key={sponsor.id}
                                            href={sponsor.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-3xl bg-white p-6 transition hover:-translate-y-1"
                                        >
                                            {content}
                                        </a>
                                    );
                                }

                                return (
                                    <div
                                        key={sponsor.id}
                                        className="rounded-3xl bg-white p-6"
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-zinc-400">
                            Kurumsal destekçilerimiz yakında burada yer alacak.
                        </div>
                    )}
                </div>

                <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                            Bireysel Destek
                        </p>

                        <h3 className="mt-2 text-2xl font-bold">
                            Bireysel Yatırımcılarımız
                        </h3>

                        <p className="mt-4 max-w-lg leading-7 text-zinc-400">
                            Holly Sport’un gelişimine bireysel ve finansal katkı sağlayan
                            yatırımcılarımıza teşekkür ederiz.
                        </p>

                        <p className="mt-4 text-sm leading-6 text-zinc-500">
                            İsimler, yatırımcıların seçtiği gizlilik tercihine göre
                            gösterilmektedir.
                        </p>
                        <p className="mb-3 text-center text-xs text-zinc-500">
                            Son 50 gün içindeki aktif bireysel destekçiler görüntülenmektedir.
                        </p>
                    </div>

                    <SupporterTicker
                        names={investorNames}
                        emptyMessage="Bireysel yatırımcılarımız yakında burada görünecek."
                    />
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-3xl bg-white px-6 py-7 text-zinc-950 sm:flex-row sm:items-center sm:px-8">
                    <div>
                        <h3 className="text-xl font-bold">
                            Sen de Holly Sport’a güç ver.
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                            Gönüllü, bireysel veya kurumsal destek seçeneklerini
                            inceleyebilirsin.
                        </p>
                    </div>

                    <Link
                        href="/destek-ol"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                        Destekçilerimiz Arasına Katıl
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}