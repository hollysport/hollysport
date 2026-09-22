import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import SmartImage from "@/components/ui/SmartImage";
import { sports } from "@/data/sports";

const featuredSlugs = ["kosu", "voleybol", "trekkinghiking"];

export default function Sports() {
  const featuredSports = featuredSlugs
    .map((slug) =>
      sports.find((sport) => sport.slug === slug),
    )
    .filter(
      (sport): sport is (typeof sports)[number] =>
        sport !== undefined,
    );

  return (
    <section
      id="sports"
      className="scroll-mt-20 overflow-hidden bg-[#050505] px-6 py-16 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
              Branşlarımız
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl">
              Kendine uygun hareketi keşfet.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/45">
            Branşını seçerek o branşa ait Holly Sport
            etkinlik fotoğraflarını keşfet.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredSports.map((sport, index) => (
            <div key={sport.slug} className="min-w-0">
              <Link
                href={`/gallery?branch=${sport.slug}`}
                className="tap-scale group relative block min-h-[290px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111111] transition duration-300 hover:border-white/25 sm:min-h-[330px]"
              >
                <SmartImage
                  src={sport.cover}
                  alt={`${sport.name} branşı`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 ease-out md:group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10 transition duration-300 md:group-hover:via-black/40" />

                <div className="relative z-10 flex h-full min-h-[290px] flex-col justify-between p-6 sm:min-h-[330px]">
                  <span className="text-sm font-bold text-white/50">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <div className="flex items-end justify-between gap-5">
                    <h3 className="text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">
                      {sport.name}
                    </h3>

                    <span className="holly-arrow-button flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-md md:group-hover:border-white md:group-hover:bg-white md:group-hover:text-black">
                      <ArrowUpRight
                        aria-hidden="true"
                        strokeWidth={2.2}
                        className="holly-arrow-icon h-5 w-5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <Link
            href="/sports"
            className="tap-scale group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition duration-300 hover:bg-[#45e27f]"
          >
            Tüm Branşları İncele

            <ArrowRight
              aria-hidden="true"
              strokeWidth={2.2}
              className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
