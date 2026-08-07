import type { Metadata } from "next";
import {
  CancellationPageView,
  cancellationMetadata,
} from "@/components/legal/legal-page";

export const metadata: Metadata = cancellationMetadata;

export default function CancellationPage() {
  return <CancellationPageView />;
}
