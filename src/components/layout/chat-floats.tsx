import { LineFloat } from "@/components/layout/line-float";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

/** Fixed stack: WhatsApp on top, LINE underneath. */
export function ChatFloats() {
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-2.5 xs:right-[max(1rem,env(safe-area-inset-right))] sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))]">
      <WhatsAppFloat />
      <LineFloat />
    </div>
  );
}
