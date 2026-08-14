"use client";
import React, { useState } from "react";
import { usePaystackPayment } from "react-paystack";

interface Props {
  total: number;
  onSuccessCallback: () => void;
}

export default function CheckoutButton({ total, onSuccessCallback }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Paystack System Configuration
  const config = {
    reference: (new Date()).getTime().toString(),
    email: "student@example.com", // In a real app, grab this from your Auth context
    amount: total * 100, // Paystack strictly requires the lowest currency unit (cents/pesewas)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);

  // 2. Payment Callbacks
  const onSuccess = (reference: any) => {
    setIsProcessing(false);
    onSuccessCallback(); // Tells the parent Cart page to clear items and redirect
  };

  const onClose = () => {
    setIsProcessing(false);
  };

  // 3. Trigger Function
  const handleCheckout = () => {
    setIsProcessing(true);
    // @ts-ignore
    initializePayment(onSuccess, onClose);
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={isProcessing}
      className={`w-full py-4 rounded-xl font-bold text-lg transition-colors shadow-md flex justify-center items-center gap-2 mb-4 ${
        isProcessing ? "bg-slate-400 cursor-not-allowed text-white" : "bg-[#196A54] hover:bg-[#12503F] text-white"
      }`}
    >
      {isProcessing ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Initializing...
        </>
      ) : (
        <>
          Proceed to Checkout
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </>
      )}
    </button>
  );
}

