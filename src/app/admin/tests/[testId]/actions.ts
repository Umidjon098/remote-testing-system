"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const addQuestionSchema = z.object({
  test_id: z.string().uuid(),
  prompt: z.string().min(1),
});

export async function addQuestionAction(formData: FormData) {
  await requireRole("admin");

  const parsed = addQuestionSchema.safeParse({
    test_id: formData.get("test_id"),
    prompt: formData.get("prompt"),
  });
  if (!parsed.success) redirect("/admin/tests?error=invalid_input");

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("questions")
    .select("position")
    .eq("test_id", parsed.data.test_id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPos = (existing?.[0]?.position ?? -1) + 1;

  const { error } = await supabase.from("questions").insert({
    test_id: parsed.data.test_id,
    prompt: parsed.data.prompt,
    position: nextPos,
  });

  if (error)
    redirect(
      `/admin/tests/${parsed.data.test_id}?error=${encodeURIComponent(
        error.message
      )}`
    );

  revalidatePath(`/admin/tests/${parsed.data.test_id}`);
  redirect(`/admin/tests/${parsed.data.test_id}`);
}

const deleteQuestionSchema = z.object({
  test_id: z.string().uuid(),
  question_id: z.string().uuid(),
});

export async function deleteQuestionAction(formData: FormData) {
  await requireRole("admin");

  const parsed = deleteQuestionSchema.safeParse({
    test_id: formData.get("test_id"),
    question_id: formData.get("question_id"),
  });
  if (!parsed.success) redirect("/admin/tests?error=invalid_input");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", parsed.data.question_id);
  if (error)
    redirect(
      `/admin/tests/${parsed.data.test_id}?error=${encodeURIComponent(
        error.message
      )}`
    );

  revalidatePath(`/admin/tests/${parsed.data.test_id}`);
  redirect(`/admin/tests/${parsed.data.test_id}`);
}

const addOptionSchema = z.object({
  test_id: z.string().uuid(),
  question_id: z.string().uuid(),
  text: z.string().min(1),
});

export async function addOptionAction(formData: FormData) {
  await requireRole("admin");

  const parsed = addOptionSchema.safeParse({
    test_id: formData.get("test_id"),
    question_id: formData.get("question_id"),
    text: formData.get("text"),
  });

  if (!parsed.success) redirect("/admin/tests?error=invalid_input");

  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("options")
    .select("position")
    .eq("question_id", parsed.data.question_id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPos = (existing?.[0]?.position ?? -1) + 1;

  const { error } = await supabase.from("options").insert({
    question_id: parsed.data.question_id,
    text: parsed.data.text,
    position: nextPos,
  });

  if (error)
    redirect(
      `/admin/tests/${parsed.data.test_id}?error=${encodeURIComponent(
        error.message
      )}`
    );

  revalidatePath(`/admin/tests/${parsed.data.test_id}`);
  redirect(`/admin/tests/${parsed.data.test_id}`);
}

const deleteOptionSchema = z.object({
  test_id: z.string().uuid(),
  option_id: z.string().uuid(),
});

export async function deleteOptionAction(formData: FormData) {
  await requireRole("admin");

  const parsed = deleteOptionSchema.safeParse({
    test_id: formData.get("test_id"),
    option_id: formData.get("option_id"),
  });

  if (!parsed.success) redirect("/admin/tests?error=invalid_input");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("options")
    .delete()
    .eq("id", parsed.data.option_id);
  if (error)
    redirect(
      `/admin/tests/${parsed.data.test_id}?error=${encodeURIComponent(
        error.message
      )}`
    );

  revalidatePath(`/admin/tests/${parsed.data.test_id}`);
  redirect(`/admin/tests/${parsed.data.test_id}`);
}

const setCorrectSchema = z.object({
  test_id: z.string().uuid(),
  question_id: z.string().uuid(),
  option_id: z.string().uuid(),
});

export async function setCorrectOptionAction(formData: FormData) {
  await requireRole("admin");

  const parsed = setCorrectSchema.safeParse({
    test_id: formData.get("test_id"),
    question_id: formData.get("question_id"),
    option_id: formData.get("option_id"),
  });

  if (!parsed.success) redirect("/admin/tests?error=invalid_input");

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("correct_options").upsert({
    question_id: parsed.data.question_id,
    option_id: parsed.data.option_id,
  });

  if (error)
    redirect(
      `/admin/tests/${parsed.data.test_id}?error=${encodeURIComponent(
        error.message
      )}`
    );

  revalidatePath(`/admin/tests/${parsed.data.test_id}`);
  redirect(`/admin/tests/${parsed.data.test_id}`);
}
