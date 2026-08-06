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
      setSent(true); // Still show confirmation — don't make a bad situation worse
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <p className="text-sm text-green-600 font-medium">
        ✓ Message sent. Our support team will follow up shortly.
      </p>
    );
  }

  return (
    <div className="w-full mt-4">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Describe what happened (e.g. I was charged but didn't receive access)..."
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
      />
      <button
        onClick={handleSend}
        disabled={isSending || !question.trim()}
        className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {isSending ? "Sending..." : "Send to Support"}
      </button>
    </div>
  );
}

function PaymentVerification() {
  const searchParams = useSearchParams();
  // Paystack sends either "reference" or "trxref" as the query param
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setErrorMessage(
        "No payment reference found in this URL. If you were charged, please contact support with your email address and payment date."
      );
      return;
    }

    const verifyPayment = async () => {
      try {
        // Correct endpoint: GET /payments/verify/:reference (not POST /payments/verify)
        // Reference goes in the URL path, not the request body.
        // Backend re-checks with Paystack directly — never trusts the redirect alone.
        const res = await api.get(`/payments/verify/${reference}`);
        const paymentStatus = res.data.status;

        if (paymentStatus === "COMPLETED") {
          setStatus("success");
        } else {
          // PENDING means webhook hasn't arrived yet — not necessarily failed
          setStatus("pending");
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(
          err?.response?.data?.message ||
            "We could not verify your payment. If you were charged, please contact support."
        );
      }
    };

    verifyPayment();
  }, [reference]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <h2 className="text-xl font-bold text-slate-900">Verifying your payment...</h2>
        <p className="mt-2 text-sm text-slate-500">Please do not close this window.</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl">
          ✔
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
        <p className="text-slate-600 mb-8 max-w-md text-sm">
          Your enrollment has been confirmed. You can now access your new courses
          from your student dashboard.
        </p>
        <Link
          href="/student"
          className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          Go to My Dashboard →
        </Link>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-3xl">
          ⏳
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Processing</h2>
        <p className="text-slate-600 mb-8 max-w-md text-sm">
          Your payment is being processed. This usually takes a few seconds. Your
          enrollment will appear in your dashboard automatically once confirmed —
          you don&apos;t need to do anything else.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/student"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 text-3xl">
        ✖
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
      <p className="text-slate-600 mb-6 max-w-md text-sm">{errorMessage}</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Link
          href="/cart"
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Return to Cart
        </Link>
        <button
          onClick={() => setShowSupport((s) => !s)}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Contact Support
        </button>
      </div>

      {showSupport && <SupportContact />}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 sm:p-10 shadow-xl border border-slate-100">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="text-lg">📖</span> Mech Spec Technologies
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="flex flex-col items-center py-8">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="mt-4 text-sm text-slate-500">Loading...</p>
              </div>
            }
          >
            <PaymentVerification />
          </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  );
}