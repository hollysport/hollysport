import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <section
      id="about"
      className="bg-[#050505] px-6 py-24 sm:py-32 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.24em] text-[#27D66B]">
            Holly Sport nedir?
          </p>

          <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Sporun etrafında büyüyen güçlü bir topluluk.
          </h2>

          <p className="mt-7 max-w-xl text-lg leading-8 text-white/55">
            Koşudan voleybola, kamptan bisiklete kadar farklı branşlarda
            insanları bir araya getiriyor; herkesin kendini ait hissedebileceği
            erişilebilir ve samimi deneyimler oluşturuyoruz.
          </p>

          <Link
            href="/about"
            className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/10"
          >
            Daha Fazlasını Oku
          </Link>
        </div>

        <div className="group relative min-h-[440px] overflow-hidden rounded-[32px] border border-white/10 bg-[#111111] sm:min-h-[560px]">
          <Image
            src="/images/about/about-communityy.jpg"
            alt="Holly Sport topluluğu"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />

          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#27D66B]">
              Birlikte daha güçlü
            </p>

            <p className="mt-3 max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">
              Hareket et, keşfet ve topluluğun bir parçası ol.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}