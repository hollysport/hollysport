import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <section
      id="about"
      className="bg-[#050505] px-6 py-20 sm:py-28 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
          Holly Sport nedir?
        </p>

        <h2 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
          Sporun etrafında büyüyen güçlü bir topluluk.
        </h2>

        <div className="mt-8 flex flex-col gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-2xl text-lg leading-8 text-white/55 sm:text-xl sm:leading-9">
            Koşudan voleybola, kamptan bisiklete kadar farklı branşlarda
            insanları bir araya getiriyor; herkesin kendini ait
            hissedebileceği erişilebilir ve samimi deneyimler
            oluşturuyoruz.
          </p>

          <Link
            href="/about"
            className="group inline-flex min-h-11 w-fit shrink-0 items-center gap-2 text-sm font-bold text-[#27D66B] transition-colors hover:text-[#45e27f]"
          >
            Daha Fazlasını Oku
            <ArrowRight
              aria-hidden="true"
              strokeWidth={2.2}
              className="h-4.5 w-4.5 text-[#27D66B] transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        <figure className="mt-14 sm:mt-16">
          <div className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 sm:h-[420px] lg:h-[540px]">
            <Image
              src="/images/about/about-communityy.jpg"
              alt="Holly Sport topluluğu"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true" />

            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#27D66B]">
                Birlikte daha güçlü
              </p>

              <p className="max-w-md text-sm font-medium leading-6 text-white/85 sm:text-base">
                Hareket et, keşfet ve topluluğun bir parçası ol.
              </p>
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}
