import { redirect } from "next/navigation";

/** Legacy URL → canonical Signature Experiences page */
export default function SensualRedirectPage() {
  redirect("/services/signature");
}
