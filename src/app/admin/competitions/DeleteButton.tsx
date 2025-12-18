"use client";

import { Button } from "@/components/ui";

interface DeleteButtonProps {
  competitionId: string;
  deleteAction: (formData: FormData) => void;
}

export function DeleteButton({
  competitionId,
  deleteAction,
}: DeleteButtonProps) {
  return (
    <form action={deleteAction}>
      <input type="hidden" name="id" value={competitionId} />
      <Button
        type="submit"
        variant="danger"
        size="sm"
        onClick={(e) => {
          if (!confirm("Ushbu musobaqani o'chirmoqchimisiz?")) {
            e.preventDefault();
          }
        }}
      >
        O&apos;chirish
      </Button>
    </form>
  );
}
