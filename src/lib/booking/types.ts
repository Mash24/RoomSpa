export type LocationType = "hotel" | "condo" | "home";

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
};

export type BookingResult = {
  id: string;
  referenceCode: string;
  amountThb: number;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  whatsappHref: string;
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
