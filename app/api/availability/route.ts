import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { reservations } from "../../../db/schema";

export const dynamic = "force-dynamic";

const appointmentTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Choose a valid appointment date." }, { status: 400 });
  }

  try {
    const rows = await getDb()
      .select({ time: reservations.time })
      .from(reservations)
      .where(eq(reservations.date, date));
    return Response.json({ slots: appointmentTimes, booked: rows.map((row) => row.time) });
  } catch {
    return Response.json({ error: "Availability is temporarily unavailable." }, { status: 503 });
  }
}
