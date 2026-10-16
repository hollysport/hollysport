import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Uzak görsel optimizasyonu için izin verilen kaynaklar.
   *
   * Etkinlik kapakları ve etkinlik galerisi Supabase Storage'dan
   * geliyor (`event-media` bucket'ı, public URL). `next/image` bu
   * görselleri sunucu tarafında yeniden boyutlandırabilsin diye
   * alan adı burada açıkça listeleniyor; böylece devasa orijinaller
   * yerine gerçek render genişliğine göre varyant üretilir.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ycxxopwtddzkmkjrwdii.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
