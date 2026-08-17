import type { TherapistStatus } from "@/lib/therapists/types";

export const THERAPIST_STATUS_OPTIONS: { value: TherapistStatus; label: string; hint: string }[] = [
  { value: "draft", label: "Draft", hint: "Hidden — profile not published" },
  { value: "active", label: "Active", hint: "Visible and bookable" },
  {
    value: "temporarily_unavailable",
    label: "Temporarily unavailable",
    hint: "Profile may stay visible; not bookable",
  },
  { value: "on_leave", label: "On leave", hint: "Not bookable while away" },
  { value: "suspended", label: "Suspended", hint: "Hidden from marketplace" },
  { value: "inactive", label: "Inactive", hint: "Hidden — former team member" },
];

export function therapistStatusFlags(status: TherapistStatus): {
  is_active: boolean;
  is_bookable: boolean;
} {
  switch (status) {
    case "active":
      return { is_active: true, is_bookable: true };
    case "temporarily_unavailable":
    case "on_leave":
      return { is_active: true, is_bookable: false };
    default:
      return { is_active: false, is_bookable: false };
  }
}

export function therapistStatusLabel(status: TherapistStatus): string {
  return THERAPIST_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}
