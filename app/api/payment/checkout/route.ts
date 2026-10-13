export const dynamic = "force-dynamic";

export async function POST() {
  // This endpoint stays closed until a hosted payment adapter, a short-lived
  // slot hold, and a signed webhook confirmation are configured together.
  return Response.json({ error: "Secure checkout is being set up. No payment has been taken." }, { status: 503 });
}
