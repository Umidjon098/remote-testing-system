import { Badge } from "@/components/ui";

type CompetitionStatus = "upcoming" | "active" | "ended";

interface CompetitionStatusBadgeProps {
  startTime: string;
  endTime: string;
}

export function getCompetitionStatus(
  startTime: string,
  endTime: string
): CompetitionStatus {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

export function CompetitionStatusBadge({
  startTime,
  endTime,
}: CompetitionStatusBadgeProps) {
  const status = getCompetitionStatus(startTime, endTime);

  const variants: Record<
    CompetitionStatus,
    { variant: "info" | "success" | "default"; label: string }
  > = {
    upcoming: { variant: "info", label: "Yakinda" },
    active: { variant: "success", label: "Faol" },
    ended: { variant: "default", label: "Yakunlangan" },
  };

  const { variant, label } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
