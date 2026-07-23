import Link from "next/link";
import { notFound } from "next/navigation";
import EventForm, {
  type EventFormInitialData,
} from "@/components/admin/event-form";
import { requireAdmin } from "@/lib/auth/require-admin";

type EditEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({
  params,
}: EditEventPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      slug,
      title,
      category,
      short_description,
      description,
      location,
      address,
      starts_at,
      ends_at,
      registration_deadline,
      capacity,
      participant_count,
      level,
      is_free,
      fee_amount,
      currency,
      price_note,
      cover_image_path,
      registration_open,
      featured,
      status,
      published_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  const { count: galleryCount } = await supabase
    .from("event_images")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("event_id", id);

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-10 text-white md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-white/10 pb-9">
          <Link
            href="/admin/events"
            className="text-sm font-semibold uppercase tracking-wider text-white/40 transition-colors hover:text-[#27D66B]"
          >
            ← Etkinliklere dön
          </Link>

          <span className="mt-10 block text-sm font-semibold uppercase tracking-[0.3em] text-[#27D66B]">
            Etkinlik Yönetimi
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Etkinliği düzenle
          </h1>

          <p className="mt-4 text-lg text-white/45">{event.title}</p>
        </header>

        <EventForm
          initialEvent={event as EventFormInitialData}
          initialGalleryCount={galleryCount ?? 0}
        />
      </div>
    </main>
  );
}