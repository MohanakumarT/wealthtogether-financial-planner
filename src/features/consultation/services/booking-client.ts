import type { ConsultationBookingValues } from "../validation/booking-schema";

export type ConsultationBookingResponse = {
  bookingReference?: string;
  error?: string;
};

export async function createConsultationBooking(
  values: ConsultationBookingValues,
) {
  const response = await fetch("/api/consultation-bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const result = (await response.json()) as ConsultationBookingResponse;
  if (!response.ok || !result.bookingReference) {
    throw new Error(
      result.error ?? "We couldn’t save your request. Please try again.",
    );
  }
  return result.bookingReference;
}
