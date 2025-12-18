"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

const createTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  time_limit_seconds: z.coerce.number().int().positive(),
  max_attempts: z.coerce.number().int().min(1),
});

export async function createTestAction(formData: FormData) {
  await requireRole("admin");

  const parsed = createTestSchema.safeParse({
    title: formData.get("title"),
    description: (formData.get("description") as string | null) ?? undefined,
    time_limit_seconds: formData.get("time_limit_seconds"),
    max_attempts: formData.get("max_attempts"),
  });

  if (!parsed.success) {
    redirect("/admin/tests?error=invalid_input");
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { error } = await supabase.from("tests").insert({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    time_limit_seconds: parsed.data.time_limit_seconds,
    max_attempts: parsed.data.max_attempts,
    created_by: userData.user.id,
    published: false,
  });

  if (error)
    redirect(`/admin/tests?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/tests");
  redirect("/admin/tests");
}

const updateTestSchema = z.object({
  test_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  time_limit_seconds: z.coerce.number().int().positive(),
  max_attempts: z.coerce.number().int().min(1),
  published: z.coerce.boolean(),
});

export async function updateTestAction(formData: FormData) {
  await requireRole("admin");

  const parsed = updateTestSchema.safeParse({
    test_id: formData.get("test_id"),
    title: formData.get("title"),
    description: (formData.get("description") as string | null) ?? undefined,
    time_limit_seconds: formData.get("time_limit_seconds"),
    max_attempts: formData.get("max_attempts"),
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    redirect("/admin/tests?error=invalid_input");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tests")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      time_limit_seconds: parsed.data.time_limit_seconds,
      max_attempts: parsed.data.max_attempts,
      published: parsed.data.published,
    })
    .eq("id", parsed.data.test_id);

  if (error)
    redirect(
      `/admin/tests/${parsed.data.test_id}?error=${encodeURIComponent(
        error.message
      )}`
    );

  revalidatePath("/admin/tests");
  revalidatePath(`/admin/tests/${parsed.data.test_id}`);
  revalidatePath("/student/tests");
  redirect(`/admin/tests/${parsed.data.test_id}`);
}

const deleteTestSchema = z.object({ test_id: z.string().uuid() });

export async function deleteTestAction(formData: FormData) {
  await requireRole("admin");

  const parsed = deleteTestSchema.safeParse({
    test_id: formData.get("test_id"),
  });
  if (!parsed.success) redirect("/admin/tests?error=invalid_input");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tests")
    .delete()
    .eq("id", parsed.data.test_id);
  if (error)
    redirect(`/admin/tests?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/tests");
  revalidatePath("/student/tests");
  redirect("/admin/tests");
}
