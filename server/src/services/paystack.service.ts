import crypto from "crypto";
import axios from "axios";
import { paystack } from "../config/paystack";
import { PLATFORM_CURRENCY } from "../config/platform";

function mapPaystackError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      "Payment provider rejected the checkout request";
    const mapped = new Error(message);
    (mapped as Error & { statusCode?: number }).statusCode = 502;
    return mapped;
  }
  return error instanceof Error ? error : new Error("Payment initialization failed");
}

// ----------------------------------------------------------------------------
// Initialize a Paystack transaction. amountInSubunit must already be in the
// smallest currency unit (pesewas for GHS, cents for USD) — matches amountCents.
// ----------------------------------------------------------------------------
export async function initializeTransaction(params: {
  email: string;
  amountInSubunit: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; accessCode: string }> {
  try {
    const response = await paystack.post("/transaction/initialize", {
      email: params.email,
      amount: params.amountInSubunit,
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: PLATFORM_CURRENCY,
      metadata: params.metadata,
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
    };
  } catch (error) {
    throw mapPaystackError(error);
  }
}

// ----------------------------------------------------------------------------
// Verify a transaction directly with Paystack — used by the fallback
// /verify endpoint when the frontend polls after redirect, in case the
// webhook hasn't arrived yet. Never trust the redirect alone.
// ----------------------------------------------------------------------------
export async function verifyTransaction(reference: string): Promise<{
  status: "success" | "failed" | "abandoned" | string;
  amount: number;
}> {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return {
      status: response.data.data.status,
      amount: response.data.data.amount,
    };
  } catch (error: any) {
    console.error(`[Paystack] Verification failed for reference ${reference}:`, error.response?.data || error.message);
    throw error;
  }
}

// ----------------------------------------------------------------------------
// Verify the webhook signature. Paystack signs the raw request body with
// your secret key (HMAC SHA512) and sends it in x-paystack-signature.
// Requires the RAW, unparsed request body — see the rawBody capture in
// app.ts. Never process a webhook payload without this check passing.
// ----------------------------------------------------------------------------
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
    .update(rawBody)
    .digest("hex");

  return hash === signature;
}
