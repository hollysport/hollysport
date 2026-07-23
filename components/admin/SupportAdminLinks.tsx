import Link from "next/link";
import {
  Building2,
  HandHeart,
  UserRoundCheck,
} from "lucide-react";

type SupportAdminLinksProps = {
  pendingSupportCount: number;
  activeInvestorCount: number;
  activeSponsorCount: number;
};

export default function SupportAdminLinks({
  pendingSupportCount,
  activeInvestorCount,
  activeSponsorCount,
}: SupportAdminLinksProps) {
  const links = [
    {
      title: "Destek Başvuruları",
      description:
        "Gönüllü, bireysel ve kurumsal destek başvurularını değerlendir.",
      href: "/admin/support-requests",
      icon: HandHeart,
      count: pendingSupportCount,
      countLabel: "bekleyen başvuru",
    },
    {
      title: "Bireysel Yatırımcılar",
      description:
        "Ana sayfadaki kayan yatırımcı isimlerini ve yayın durumlarını yönet.",
      href: "/admin/supporters",
      icon: UserRoundCheck,
      count: activeInvestorCount,
      countLabel: "aktif yatırımcı",
    },
    {
      title: "Kurumsal Destekçiler",
      description:
        "Firma logolarını, kategorilerini ve yayın durumlarını yönet.",
      href: "/admin/sponsors",
      icon: Building2,
      count: activeSponsorCount,
      countLabel: "aktif kurum",
    },
  ];

  return (
    <section className="mt-12">
      <div>
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
          Destek Yönetimi
        </span>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Destekçiler ve başvurular
        </h2>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-72 flex-col justify-between rounded-3xl border border-white/10 bg-[#111111] p-7 transition hover:-translate-y-1 hover:border-[#27D66B]/50"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#27D66B]/10 text-[#27D66B] transition group-hover:bg-[#27D66B] group-hover:text-black">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/40">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                  <strong className="block text-4xl font-bold text-[#27D66B]">
                    {item.count}
                  </strong>

                  <span className="mt-1 block text-xs uppercase tracking-wider text-white/30">
                    {item.countLabel}
                  </span>
                </div>

                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl text-black transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}