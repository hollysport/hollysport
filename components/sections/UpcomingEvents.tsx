import { createClient } from "@/lib/supabase/server";
import UpcomingEventsClient from "@/components/sections/UpcomingEventsClient";

type UpcomingEvent = {
    id: string;
    slug: string;
    title: string;
    category: string;
    location: string;
    starts_at: string;
    ends_at: string;
    cover_image_path: string | null;
    registration_open: boolean;
    participant_count: number;
    capacity: number | null;
};

export type UpcomingEventView = UpcomingEvent & {
    image_url: string | null;
};

export default async function UpcomingEvents() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("events")
        .select(`
            id,
            slug,
            title,
            category,
            location,
            starts_at,
            ends_at,
            cover_image_path,
            registration_open,
            participant_count,
            capacity
        `)
        .eq("status", "published")
        .gte("ends_at", now)
        .order("starts_at", { ascending: true })
        .limit(3);

    const events = ((data ?? []) as UpcomingEvent[]).map(
        (event): UpcomingEventView => {
            let imageUrl: string | null = null;

            if (event.cover_image_path) {
                imageUrl = supabase.storage
                    .from("event-media")
                    .getPublicUrl(event.cover_image_path).data.publicUrl;
            }

            return {
                ...event,
                image_url: imageUrl,
            };
        },
    );

    return (
        <UpcomingEventsClient
            events={events}
            errorMessage={
                error
                    ? `Etkinlikler yüklenirken hata oluştu: ${error.message}`
                    : null
            }
        />
    );
}