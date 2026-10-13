import { getPhoneOtpProvider } from "../../../../lib/booking-providers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { phone?: unknown };
  try { body = await request.json() as { phone?: unknown }; }
  catch { return Response.json({ error: "Enter a valid phone number." }, { status: 400 }); }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!/^\+?[\d\s().-]{7,24}$/.test(phone)) return Response.json({ error: "Enter a valid phone number with country code." }, { status: 400 });
  const provider = getPhoneOtpProvider();
  if (!provider) return Response.json({ error: "Phone verification is being set up. Please try again later." }, { status: 503 });

  try {
    const challenge = await provider.startChallenge({ phone, purpose: "appointment_booking" });
    return Response.json(challenge, { status: 202 });
  } catch {
    return Response.json({ error: "We couldn’t send a code. Please wait a moment and try again." }, { status: 503 });
  }
}
