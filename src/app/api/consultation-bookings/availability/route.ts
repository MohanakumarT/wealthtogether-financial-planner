import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    availableSlots: [
      "10:00 AM",
      "11:30 AM",
      "2:00 PM",
      "4:00 PM",
      "6:30 PM",
      "8:00 PM",
    ],
  });
}
