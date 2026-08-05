export type LocationType = "hotel" | "condo" | "home";
export type PaymentPreference = "cash" | "card_later" | "card_now";

export type BookingPayload = {
  serviceSlug: string;
  coverageAreaSlug?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locationType: LocationType;
  locationLabel: string;
  locationDetails?: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  paymentPreference?: PaymentPreference;
  payNow?: boolean;
};

export type BookingResult = {
  id: string;
  referenceCode: string;
  accessPin: string;
  amountThb: number;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  customerEmail: string;
  paymentMethod: string;
  whatsappHref: string;
  checkoutUrl?: string;
};

export type BookingSummary = {
  id: string;
  referenceMasked: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  amountThb: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  canPay: boolean;
};

export const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
] as const;
