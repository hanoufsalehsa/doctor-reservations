# Phone verification and payment adapters

The booking UI and server routes use provider-neutral boundaries in `lib/booking-providers.ts`. Provider SDKs and credentials belong in server code and Sites runtime secrets. Do not collect or store card numbers in this app.

## Phone OTP

Implement `PhoneOtpProvider` for the chosen SMS/verification service. The adapter must send a short-lived code to the normalized phone number, limit resend and verification attempts, and bind the result to both that phone and this booking flow. `verifyChallenge` returns a server-verifiable `verificationToken`; the browser's `phoneVerified` state is only presentation. Checkout must call `isVerified` on the server before it creates a payment session.

## Hosted payment

Implement `HostedPaymentProvider` for the chosen checkout service. Use an amount and ISO currency supplied by server configuration (`BOOKING_FEE_MINOR`, `BOOKING_CURRENCY`), create a short-lived slot hold before redirecting, and send the provider an idempotency key. Return only the provider's hosted checkout URL to the browser; this site must never receive raw card details.

Confirm an appointment only from a signed provider webhook. Verify the signature, checkout ID, idempotency key, amount, and currency on the server. Make webhook processing idempotent, persist the payment reference, and convert the matching slot hold into a reservation once. A browser return URL alone is not proof of payment. Release holds after failed or expired checkouts.

## Current state

No OTP or payment provider is selected or connected. The adapters return `null`, checkout returns a setup response, and unpaid reservations cannot be created. The booking page shows each integration state and fee configuration. After choosing providers and a fee, implement their adapters and the atomic hold/webhook path before enabling the corresponding readiness flags.
