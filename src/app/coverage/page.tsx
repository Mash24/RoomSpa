import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "Coverage Area",
  description: "See where RoomSpa currently delivers in-room massage — city-flexible and ready to expand.",
};

export default function CoveragePage() {
  return (
    <PlaceholderPage
      title="Coverage area"
      description="Service zones will be managed in admin so you can add cities without a rebrand."
    />
  );
}
