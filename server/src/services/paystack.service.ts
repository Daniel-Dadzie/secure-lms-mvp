import crypto from "crypto";
import { paystack } from "../config/paystack";

// ----------------------------------------------------------------------------
// Initialize a Paystack transaction. amountInSubunit must already be in the
// smallest currency unit (pesewas for GHS) — matches how amountCents/
// finalAmountCents are already stored, so no conversion needed here.
// ----------------------------------------------------------------------------
export async function initializeTransaction(params: {
  email: string;
  amountInSubunit: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; accessCode: string }> {
  const response = await paystack.post("/transaction/initialize", {
    email: params.email,
    amount: params.amountInSubunit,
    reference: params.reference,
    callback_url: params.callbackUrl,
    currency: "GHS",
    metadata: params.metadata,
  });

  return {
    authorizationUrl: response.data.data.authorization_url,
    accessCode: response.data.data.access_code,
  };
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
  const response = await paystack.get(`/transaction/verify/${reference}`);
  return {
    status: response.data.data.status,
    amount: response.data.data.amount,
  };
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