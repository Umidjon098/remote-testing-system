"use client";

import { Button } from "@/components/ui";
import { useState } from "react";

interface JoinButtonProps {
  competitionId: string;
  joinAction: (formData: FormData) => void;
}

export function JoinButton({ competitionId, joinAction }: JoinButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true);
        await joinAction(formData);
      }}
    >
      <input type="hidden" name="competition_id" value={competitionId} />
      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Qatnashmoqda..." : "Qatnashish"}
      </Button>
    </form>
  );
}
