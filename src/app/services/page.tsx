import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore RoomSpa massage services delivered to your hotel, condo, or home — Swedish, deep tissue, aromatherapy, and couples sessions.",
};

export default function ServicesPage() {
  return (
    <PlaceholderPage
      title="Services"
      description="Detailed service pages, durations, and therapist matching land next in Phase 1."
    />
  );
}
