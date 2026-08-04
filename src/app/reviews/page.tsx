import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Guest reviews for RoomSpa in-room massage experiences.",
};

export default function ReviewsPage() {
  return (
    <PlaceholderPage
      title="Reviews"
      description="Moderated testimonials and ratings arrive in Phase 2, with CMS management from day one of that phase."
    />
  );
}
