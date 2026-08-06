import Link from "next/link";
import React from "react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] bg-[#F4F9F7] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100 shadow-xl relative overflow-hidden">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#196A54]/10 to-transparent"></div>

        <div className="relative z-10">
          {/* Success Icon */}
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A4A3A] mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-slate-600 mb-8 text-lg">
            Welcome to the class! Your payment has been processed and your courses have been added to your account.
          </p>

          {/* Order Details Card */}
          <div className="bg-[#F4F9F7] rounded-2xl p-6 text-left mb-8 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Order Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number:</span>
                <span className="font-bold text-slate-900">#ORD-{Math.floor(Math.random() * 1000000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GH')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-[#196A54]">$248.00</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-500">
                A receipt has been sent to your email. You can also view your full purchase history in your account settings.
              </p>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard/student" 
              className="bg-[#196A54] hover:bg-[#12503F] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md transform hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/courses" 
              className="bg-white text-slate-700 border-2 border-slate-200 hover:border-[#196A54] hover:text-[#196A54] px-8 py-3.5 rounded-xl font-bold transition-colors"
            >
              Browse More
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}