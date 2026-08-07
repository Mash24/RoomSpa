import type { Metadata } from "next";
import { TermsPageView, termsMetadata } from "@/components/legal/legal-page";

export const metadata: Metadata = termsMetadata;

export default function TermsPage() {
  return <TermsPageView />;
}
