"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateCompetitionAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const maxParticipants = formData.get("max_participants") as string;
  const published = formData.get("published") === "on";

  if (!id || !title || !startDate || !endDate) {
    redirect(`/admin/competitions/${id}?error=Missing required fields`);
  }

  const { error } = await supabase
    .from("competitions")
    .update({
      title,
      description,
      start_time: startDate,
      end_time: endDate,
      max_participants: maxParticipants ? parseInt(maxParticipants) : null,
      published,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/competitions/${id}?error=${encodeURIComponent(error.message)}`
    );
  }

  revalidatePath("/admin/competitions");
  revalidatePath(`/admin/competitions/${id}`);
  redirect(`/admin/competitions/${id}`);
}
