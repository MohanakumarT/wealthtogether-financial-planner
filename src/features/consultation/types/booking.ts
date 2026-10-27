export type ConsultationServiceId =
  | "investment-blueprint"
  | "financial-freedom-cohort"
  | "invest-through-wealthtogether";

export type ConsultationBookingStatus =
  "Pending" | "Confirmed" | "Completed" | "Cancelled";

export type FinancialGoal =
  | "Retirement"
  | "House"
  | "Car"
  | "Kids Education"
  | "Wealth Creation"
  | "Emergency Fund"
  | "Other";

export type ConsultationBooking = {
  booking_id: string;
  booking_reference: string;
  service: string;
  price: number;
  booking_status: ConsultationBookingStatus;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  age: number;
  occupation: string;
  income: number;
  city: string;
  investment_experience: boolean;
  monthly_sip: number;
  financial_goals: FinancialGoal[];
  investment_budget: number;
  risk_profile: "Conservative" | "Moderate" | "Aggressive";
  preferred_date: string;
  preferred_time: (typeof import("../constants/services").appointmentTimeSlots)[number];
  time_zone: string;
  meeting_mode: "Google Meet" | "Phone Call";
  notes: string;
  created_at: string;
};
