import SmartImage from "@/components/ui/SmartImage";
import Link from "next/link";

import { sports } from "@/data/sports";

const featuredSlugs = [
  "kosu",
  "voleybol",
  "trekkinghiking",
];

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
      className="scroll-mt-20 bg-[#050505] px-6 py-16 sm:py-20 lg:px-8"
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
            <Link
              key={sport.slug}
              href={`/gallery?branch=${sport.slug}`}
              className="group relative min-h-[290px] overflow-hidden rounded-[28px] border border-white/10 sm:min-h-[330px]"
            >
              <SmartImage
                src={sport.cover}
                alt={`${sport.name} branşı`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10 transition duration-500 group-hover:via-black/35" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6">
                <span className="text-sm font-bold text-white/50">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex items-end justify-between gap-5">
                  <h3 className="text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">
                    {sport.name}
                  </h3>

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
                    ↗
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <Link
            href="/sports"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#27D66B] px-7 text-sm font-bold text-[#050505] transition hover:bg-[#45e27f]"
          >
            Tüm Branşları İncele
          </Link>
        </div>
      </div>
    </section>
  );
}