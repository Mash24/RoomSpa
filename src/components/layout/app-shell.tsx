"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AttributionBootstrap } from "@/components/analytics/attribution-bootstrap";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

const ChatWidget = dynamic(
  () => import("@/components/chat/chat-widget").then((mod) => mod.ChatWidget),
  { ssr: false },
);

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
      <main className={`flex-1 ${isBooking || isTherapistGallery ? "" : "page-bottom-clearance"}`}>
        {children}
      </main>
      {!isBooking ? <ChatWidget /> : null}
      {!isBooking ? <WhatsAppFloat /> : null}
      {!isTherapistGallery ? <SiteFooter /> : null}
    </>
  );
}
