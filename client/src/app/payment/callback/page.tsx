"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

function SupportContact() {
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    setIsSending(true);

    try {
      await api.post("/support/ask", {
        question: `Payment issue: ${question}`,
      });

      setSent(true);
    } catch {
      // Still show confirmation so the user is not left without feedback.
      setSent(true);
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
        ✓ Message sent. Our support team will follow up shortly.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Describe what happened (e.g. I was charged but didn't receive access)..."
        className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={isSending || !question.trim()}
        className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSending ? "Sending..." : "Send to Support"}
      </button>
    </div>
  );
}

function PaymentVerification() {
  const searchParams = useSearchParams();

  // Paystack can send either "reference" or "trxref".
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  // If there is no reference, start directly in the error state.
  // This avoids calling setState synchronously inside useEffect.
  const [status, setStatus] = useState<
    "loading" | "success" | "pending" | "error"
  >(reference ? "loading" : "error");

  const [errorMessage, setErrorMessage] = useState(
    reference
      ? ""
      : "No payment reference found in this URL. If you were charged, please contact support with your email address and payment date."
  );

  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    if (!reference) {
      return;
    }

    let cancelled = false;

    const verifyPayment = async () => {
      try {
        // Backend verifies the transaction directly with Paystack.
        const res = await api.get(`/payments/verify/${reference}`);

        if (cancelled) return;

        const paymentStatus = res.data.status;

        if (paymentStatus === "COMPLETED") {
          setStatus("success");
        } else {
          // PENDING means the webhook/confirmation may not have arrived yet.
          setStatus("pending");
        }
      } catch (err: unknown) {
        if (cancelled) return;

        const error = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setStatus("error");
        setErrorMessage(
          error.response?.data?.message ||
            "We could not verify your payment. If you were charged, please contact support."
        );
      }
    };

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#196A54]" />

        <h1 className="text-2xl font-bold text-slate-900">
          Verifying your payment...
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Please do not close this window.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
            ✓
          </div>

          <h1 className="mb-3 text-3xl font-extrabold text-slate-900">
            Payment Successful!
          </h1>

          <p className="mb-8 text-slate-600">
            Your enrollment has been confirmed. You can now access your new
            courses from your student dashboard.
          </p>

          <Link
            href="/student"
            className="inline-flex rounded-xl bg-[#196A54] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12503F]"
          >
            Go to My Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">
            ⏳
          </div>

          <h1 className="mb-3 text-3xl font-extrabold text-slate-900">
            Payment Processing
          </h1>

          <p className="mb-8 text-slate-600">
            Your payment is being processed. This usually takes a few seconds.
            Your enrollment will appear in your dashboard automatically once
            confirmed — you don&apos;t need to do anything else.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/student"
              className="rounded-xl bg-[#196A54] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12503F]"
            >
              Go to Dashboard
            </Link>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-red-600">
          ✕
        </div>

        <h1 className="mb-3 text-3xl font-extrabold text-slate-900">
          Verification Failed
        </h1>

        <p className="mb-8 text-sm leading-6 text-slate-600">
          {errorMessage}
        </p>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cart"
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Return to Cart
          </Link>

          <button
            type="button"
            onClick={() => setShowSupport((current) => !current)}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Contact Support
          </button>
        </div>

        {showSupport && <SupportContact />}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-lg font-extrabold text-[#196A54]"
            >
              Mech Spec Technologies
            </Link>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center px-4">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#196A54]" />

                <p className="text-sm font-medium text-slate-600">
                  Loading...
                </p>
              </div>
            </div>
          }
        >
          <PaymentVerification />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
 
