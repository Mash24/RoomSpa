import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "Book Appointment",
  description: "Book a RoomSpa massage at your hotel, condo, or home. Real-time availability coming soon.",
};

export default function BookPage() {
  return (
    <PlaceholderPage
      title="Book appointment"
      description="Online calendar, service selection, travel area, and confirmations are next on the Phase 1 roadmap."
    />
  );
}
