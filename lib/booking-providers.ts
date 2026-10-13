/** Server-only provider contracts. Provider secrets and SDKs stay in server code. */
export type PhoneChallenge = { challengeId: string; expiresAt: string };

export interface PhoneOtpProvider {
  readonly id: string;
  startChallenge(input: { phone: string; purpose: "appointment_booking" }): Promise<PhoneChallenge>;
  verifyChallenge(input: { challengeId: string; phone: string; code: string }): Promise<{ verified: boolean; verificationToken?: string }>;
  isVerified(input: { phone: string; verificationToken: string }): Promise<boolean>;
}

export type CheckoutRequest = {
  idempotencyKey: string;
  amountMinor: number;
  currency: string;
  patient: { name: string; email: string; phone: string };
  appointment: { date: string; time: string; timezone: string };
  returnUrl: string;
};

export interface HostedPaymentProvider {
  readonly id: string;
  createCheckout(input: CheckoutRequest): Promise<{ checkoutId: string; checkoutUrl: string }>;
  /** Validate the provider signature and return the normalized event. */
  verifyWebhook(request: Request): Promise<{
    eventId: string;
    checkoutId: string;
    status: "paid" | "failed" | "refunded";
    amountMinor: number;
    currency: string;
    idempotencyKey: string;
  } | null>;
}

// Add provider-specific adapters here (for example Twilio, Unifonic, Moyasar,
// PayTabs or Stripe). Select them server-side from runtime configuration; never
// expose API keys or accept a client-supplied "verified" or "paid" flag.
export function getPhoneOtpProvider(): PhoneOtpProvider | null {
  return null;
}

export function getHostedPaymentProvider(): HostedPaymentProvider | null {
  return null;
}
