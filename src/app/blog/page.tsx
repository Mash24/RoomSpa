import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "Blog",
  description: "Travel wellness tips and local guides from RoomSpa — built for search intent and internal linking.",
};

export default function BlogPage() {
  return (
    <PlaceholderPage
      title="Blog"
      description="CMS-powered articles and SEO landing pages for searches like hotel massage and mobile massage."
    />
  );
}
