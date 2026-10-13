import { env } from "cloudflare:workers";
import { getPhoneOtpProvider } from "../../../lib/booking-providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const parsedFee = Number.parseInt(env.BOOKING_FEE_MINOR ?? "", 10);
  const feeMinor = Number.isSafeInteger(parsedFee) && parsedFee > 0 ? parsedFee : null;
  const currency = /^[A-Z]{3}$/.test(env.BOOKING_CURRENCY ?? "") ? env.BOOKING_CURRENCY! : "SAR";

  return Response.json({
    phoneOtpReady: getPhoneOtpProvider() !== null,
    // Keep checkout disabled until the payment adapter, atomic slot hold, and
    // signed webhook settlement are implemented together.
    paymentReady: false,
    feeMinor,
    currency,
  });
}
