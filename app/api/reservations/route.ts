import { getDb } from "../../../db";
import { reservations } from "../../../db/schema";

export const dynamic = "force-dynamic";

const appointmentTimes = new Set(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]);

function isClinicWeekday(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date && ![0, 6].includes(parsed.getUTCDay());
}

function currentRiyadhDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Please check your details and try again." }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const date = typeof payload.date === "string" ? payload.date : "";
  const time = typeof payload.time === "string" ? payload.time : "";

  if (name.length < 2 || name.length > 100) return Response.json({ error: "Enter your name (up to 100 characters)." }, { status: 400 });
  if (email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  if (phone.length < 7 || phone.length > 30) return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
  if (!isClinicWeekday(date) || date < currentRiyadhDate() || !appointmentTimes.has(time)) {
    return Response.json({ error: "Choose a valid weekday and appointment time." }, { status: 400 });
  }

  try {
    const [reservation] = await getDb().insert(reservations).values({ name, email, phone, date, time }).returning({
      id: reservations.id,
      name: reservations.name,
      email: reservations.email,
      phone: reservations.phone,
      date: reservations.date,
      time: reservations.time,
    });
    return Response.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && /unique|constraint/i.test(`${error.message} ${String(error.cause)}`)) {
      return Response.json({ error: "That time is no longer available. Please choose another slot." }, { status: 409 });
    }
    return Response.json({ error: "We couldn’t save your appointment. Please try again." }, { status: 503 });
  }
}
