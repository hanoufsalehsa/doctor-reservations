import { getPhoneOtpProvider } from "../../../../lib/booking-providers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { challengeId?: unknown; phone?: unknown; code?: unknown };
  try { body = await request.json() as { challengeId?: unknown; phone?: unknown; code?: unknown }; }
  catch { return Response.json({ error: "Enter the code sent to your phone." }, { status: 400 }); }

  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";
  if (!challengeId || challengeId.length > 200 || !/^\d{6}$/.test(code) || !/^\+?[\d\s().-]{7,24}$/.test(phone)) {
    return Response.json({ error: "Enter the 6-digit code sent to your phone." }, { status: 400 });
  }
  const provider = getPhoneOtpProvider();
  if (!provider) return Response.json({ error: "Phone verification is being set up. Please try again later." }, { status: 503 });

  try {
    const result = await provider.verifyChallenge({ challengeId, phone, code });
    if (!result.verified || !result.verificationToken) return Response.json({ error: "That code is incorrect or has expired." }, { status: 400 });
    return Response.json({ verified: true, verificationToken: result.verificationToken });
  } catch {
    return Response.json({ error: "That code could not be verified. Please request a new one." }, { status: 503 });
  }
}
