import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact RoomSpa for booking help, partnerships, and coverage questions.",
};

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact"
      description="Contact form with rate limiting and CAPTCHA lands with the admin/security pass."
    />
  );
}
