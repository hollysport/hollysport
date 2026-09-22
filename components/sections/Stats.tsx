import { sports } from "@/data/sports";

import StatsClient, { type StatItem } from "./StatsClient";

/*
 * Tarihsel topluluk toplamları.
 * Canlı Supabase count'ları yerine topluluğun kuruluşundan bugüne kadarki
 * kümülatif gerçek rakamları gösteriyoruz (Holly Sport ekibi tarafından
 * sağlanan resmi veriler: 300+ etkinlik, 1000+ sporcu).
 * Branş sayısı mevcut canlı kaynaktan (data/sports.ts) dinamik alınıyor.
 */
const stats: StatItem[] = [
  {
    label: "Etkinlik",
    value: 300,
  },
  {
    label: "Sporcu",
    value: 1000,
  },
  {
    label: "Branş",
    value: sports.length,
  },
];

export default function Stats() {
  return <StatsClient stats={stats} />;
}
