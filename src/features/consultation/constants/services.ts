import type { ConsultationServiceId, FinancialGoal } from "../types/booking";

export const consultationServices: {
  id: ConsultationServiceId;
  name: string;
  price: number;
  priceLabel: string;
  duration: string;
    mode?: string;
  description: string;
  featured?: boolean;
}[] = [
  {
    id: "investment-blueprint",
    name: "WealthTogether Investment Blueprint™",
    price: 1499,
    priceLabel: "₹1,499",
    duration: "120 Minutes",
    mode: "Google Meet",
    description: "Two focused sessions and a personal investment roadmap.",
    featured: true,
  },
  {
    id: "financial-freedom-cohort",
    name: "WealthTogether Financial Freedom Cohort™",
    price: 4999,
    priceLabel: "₹4,999",
    duration: "4 Weeks",
    mode: "Live Online",
    description: "A structured, practical financial education program.",
  },
  {
    id: "invest-through-wealthtogether",
    name: "Invest Through WealthTogether",
    price: 0,
    priceLabel: "Free",
    duration: "Investment Support",
    description: "Goal-based investment support and ongoing guidance.",
  },
];

export const financialGoals: FinancialGoal[] = [
  "Retirement",
  "House",
  "Car",
  "Kids Education",
  "Wealth Creation",
  "Emergency Fund",
  "Other",
];

export const appointmentTimeSlots = [
  "10:00 AM",
  "11:30 AM",
  "2:00 PM",
  "4:00 PM",
  "6:30 PM",
  "8:00 PM",
] as const;
export const meetingModes = ["Google Meet", "Phone Call"] as const;
export const riskProfiles = ["Conservative", "Moderate", "Aggressive"] as const;

export const consultationSteps = [
  "Service",
  "Personal",
  "Financial",
  "Schedule",
  "Notes",
  "Review",
] as const;
