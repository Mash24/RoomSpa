import { randomInt } from "crypto";

export function generateBookingPin() {
  return String(randomInt(1000, 10000));
}

export function paymentMethodLabel(method: string) {
  switch (method) {
    case "cash":
      return "Pay cash on arrival";
    case "card_later":
      return "Pay by card later";
    case "card_now":
      return "Pay by card now";
    case "card":
      return "Paid by card";
    default:
      return "Not set";
  }
}

export function mapPaymentPreferenceToMethod(
  preference: "cash" | "card_later" | "card_now",
  paid = false,
) {
  if (paid) return "card";
  return preference;
}
