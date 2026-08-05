const BANGKOK = "Asia/Bangkok";

export function todayInBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BANGKOK,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatBookingDateTime(date: string, time: string) {
  const normalizedTime = time.length >= 5 ? time.slice(0, 5) : time;
  const parsed = new Date(`${date}T${normalizedTime}:00+07:00`);

  if (Number.isNaN(parsed.getTime())) {
    return `${date} ${normalizedTime}`;
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BANGKOK,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}
