import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about booking RoomSpa mobile massage appointments.",
};

export default function FaqPage() {
  return (
    <PlaceholderPage
      title="FAQ"
      description="SEO-friendly FAQ with schema markup will be content-managed from the admin panel."
    />
  );
}
