export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json({ error: "Phone verification and payment are required before a reservation can be confirmed." }, { status: 503 });
}
