"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";

type DeleteEventResult = {
  success: boolean;
  error?: string;
  warning?: string;
};

export async function deleteEvent(
  eventId: string,
): Promise<DeleteEventResult> {
  if (!eventId) {
    return {
      success: false,
      error: "Etkinlik kimliği bulunamadı.",
    };
  }

  const { supabase } = await requireAdmin();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, slug, title, cover_image_path")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) {
    return {
      success: false,
      error: `Etkinlik okunamadı: ${eventError.message}`,
    };
  }

  if (!event) {
    return {
      success: false,
      error: "Silinecek etkinlik bulunamadı.",
    };
  }

  const { data: galleryImages, error: galleryError } = await supabase
    .from("event_images")
    .select("storage_path")
    .eq("event_id", eventId);

  if (galleryError) {
    return {
      success: false,
      error: `Etkinlik galerisi okunamadı: ${galleryError.message}`,
    };
  }

  const storagePaths = [
    ...(event.cover_image_path ? [event.cover_image_path] : []),
    ...(galleryImages ?? []).map((image) => image.storage_path),
  ];

  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (deleteError) {
    return {
      success: false,
      error: `Etkinlik silinemedi: ${deleteError.message}`,
    };
  }

  let warning: string | undefined;

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("event-media")
      .remove(storagePaths);

    if (storageError) {
      warning =
        "Etkinlik silindi ancak bazı görsel dosyaları temizlenemedi.";
    }
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${event.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/events");

  return {
    success: true,
    warning,
  };
}