import type { TherapistStatus } from "@/lib/therapists/types";

/** Kept for legacy rows / soft internal restriction only — not the primary admin UX. */
export const THERAPIST_STATUS_OPTIONS: {
  value: TherapistStatus;
  label: string;
  hint: string;
  group: "live" | "ops" | "hidden";
}[] = [
  { value: "active", label: "Active", hint: "Normal account", group: "live" },
  { value: "suspended", label: "Suspended", hint: "Blocked — hidden everywhere", group: "hidden" },
  { value: "inactive", label: "Inactive", hint: "Former team member", group: "hidden" },
  { value: "draft", label: "Draft", hint: "Legacy — prefer Show on gallery OFF", group: "hidden" },
];

/** @deprecated */
export const THERAPIST_PIPELINE: TherapistStatus[] = ["active"];

export function isPublicLifecycleStatus(status: TherapistStatus): boolean {
  return status !== "suspended" && status !== "inactive";
}

export function therapistStatusFlags(status: TherapistStatus): {
  is_active: boolean;
  is_bookable: boolean;
} {
  switch (status) {
    case "active":
    case "fully_booked":
    case "temporarily_unavailable":
    case "on_leave":
      return { is_active: true, is_bookable: status === "active" || status === "fully_booked" };
    default:
      return { is_active: false, is_bookable: false };
  }
}

export function therapistStatusLabel(status: TherapistStatus): string {
  return THERAPIST_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function assertServiceQualification(input: {
  claimed: boolean;
  tested: boolean;
  approved: boolean;
}): string | null {
  if (input.tested && !input.claimed) {
    return "A service must be claimed before it can be marked tested.";
  }
  if (input.approved && !input.tested) {
    return "A service must be tested before it can be approved for the public gallery.";
  }
  return null;
}
