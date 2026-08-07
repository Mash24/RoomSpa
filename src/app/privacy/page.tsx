import type { Metadata } from "next";
import { PrivacyPageView, privacyMetadata } from "@/components/legal/legal-page";

export const metadata: Metadata = privacyMetadata;

export default function PrivacyPage() {
  return <PrivacyPageView />;
}
