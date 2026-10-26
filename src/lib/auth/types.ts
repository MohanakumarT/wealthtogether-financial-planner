export type UserRole = "admin" | "client";

export type UserProfile = {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string;
  dob: string | null;
  occupation: string;
  city: string;
  country: string;
  avatar: string;
  monthly_income: number;
  current_monthly_sip: number;
  risk_profile: "conservative" | "moderate" | "aggressive" | "not_assessed";
  created_at: string;
  updated_at: string;
};

export type AuthIdentity = {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
};
