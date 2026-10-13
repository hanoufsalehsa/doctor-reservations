declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    BUCKET?: R2Bucket;
    BOOKING_FEE_MINOR?: string;
    BOOKING_CURRENCY?: string;
  }
}
