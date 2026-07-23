import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { sports } from "@/data/sports";

export const metadata: Metadata = {
  title: "Branşlarımız | Holly Sport",
  description:
    "Holly Sport branşlarını keşfet ve branşlara ait etkinlik fotoğraflarını incele.",
};

export default function SportsPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        <section className="bg-[#050505] py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
              Branşlarımız
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold tracking-[-0.04em] sm:text-6xl">
              Branşını seç, anıları keşfet.
            </h1>

            <p className="mt-6 max-w-2xl leading-7 text-white/50 sm:text-lg">
              Bir branşa tıklayarak o branşa ait etkinlik fotoğraflarını
              galeride görüntüleyebilirsin.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            {sports.map((sport) => (
              <Link
                key={sport.slug}
                href={`/gallery?branch=${sport.slug}`}
                className="group relative min-h-[340px] overflow-hidden rounded-[2rem] bg-zinc-900 transition-transform duration-300 active:scale-[0.985]"
              >
                <Image
                  src={sport.cover}
                  alt={`${sport.name} branşı`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out md:group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-7">
                  <h2 className="text-3xl font-extrabold text-white">
                    {sport.name}
                  </h2>

                  <span className="holly-arrow-button flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white text-black">
                    <ArrowUpRight
                      aria-hidden="true"
                      strokeWidth={2.2}
                      className="holly-arrow-icon h-5 w-5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}