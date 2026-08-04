import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent RoomSpa pricing for in-room massage sessions at hotels, condos, and homes.",
};

export default function PricingPage() {
  return (
    <PlaceholderPage
      title="Pricing"
      description="Clear session rates and travel fees will live here — structured for SEO and easy CMS updates."
    />
  );
}
