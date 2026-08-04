import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about RoomSpa — premium mobile massage for travelers, expats, and locals.",
};

export default function AboutPage() {
  return (
    <PlaceholderPage
      title="About"
      description="Brand story, standards, and therapist credentials will be editable from the admin CMS."
    />
  );
}
