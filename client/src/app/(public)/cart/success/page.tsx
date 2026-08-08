
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const orderNumber = "ORD-SUCCESS";
  const orderDate = new Date().toLocaleDateString("en-GH");

  return (
    <div className="relative min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
      {/* Background Decorative Element */}
      <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-b from-[#196A54]/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-green-100 shadow-sm">
          <svg
            className="h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mb-4 text-3xl font-extrabold text-[#0A4A3A] sm:text-4xl">
          Payment Successful!
        </h1>

        <p className="mb-8 text-lg text-slate-600">
          Welcome to the class! Your payment has been processed and your
          courses have been added to your account.
        </p>

        {/* Order Details Card */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-[#F4F9F7] p-6 text-left">
          <h3 className="mb-4 border-b border-slate-200 pb-2 font-bold text-slate-900">
            Order Details
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Number:</span>
              <span className="font-bold text-slate-900">
                #{orderNumber}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold text-slate-900">{orderDate}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-[#196A54]">$248.00</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 border-t border-slate-200 pt-4">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <p className="text-xs text-slate-500">
              A receipt has been sent to your email. You can also view your
              full purchase history in your account settings.
            </p>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/dashboard/student"
            className="rounded-xl bg-[#196A54] px-8 py-3.5 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#12503F]"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/courses"
            className="rounded-xl border-2 border-slate-200 bg-white px-8 py-3.5 font-bold text-slate-700 transition-colors hover:border-[#196A54] hover:text-[#196A54]"
          >
            Browse More
          </Link>
        </div>
      </div>
    </div>
  );
}

