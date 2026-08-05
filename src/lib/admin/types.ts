export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export type AdminBooking = {
  id: string;
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  locationType: string;
  locationLabel: string;
  locationDetails: string;
  status: BookingStatus;
  paymentStatus: string;
  paymentMethod: string;
  amountThb: number;
  notes: string;
  createdAt: string;
};

export type AdminDashboardStats = {
  bookingsThisWeek: number;
  revenueThisWeekThb: number;
  pendingCount: number;
  todayCount: number;
  upcomingCount: number;
};

export type BookingFilter = "today" | "upcoming" | "all";
