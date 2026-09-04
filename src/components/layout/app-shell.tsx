"use client";

import { usePathname } from "next/navigation";
import { AttributionBootstrap } from "@/components/analytics/attribution-bootstrap";
import { ChatWidget } from "@/components/chat/chat-widget";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isBooking = pathname.startsWith("/book");
  const isTherapistGallery = pathname === "/therapists" || pathname.startsWith("/therapists/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AttributionBootstrap />
      <SiteHeader />
      <main className={`flex-1 ${isBooking || isTherapistGallery ? "" : "page-bottom-clearance"}`}>{children}</main>
      {!isBooking ? <ChatWidget /> : null}
      {!isBooking ? <WhatsAppFloat /> : null}
      {!isTherapistGallery ? <SiteFooter /> : null}
    </>
  );
}
