"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

interface ToastState {
  message: string;
  type: ToastType;
}

const TYPE_CLASSES: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-slate-900",
};

export function Toast({
  message,
  type = "info",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [onClose, duration]);

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl ${TYPE_CLASSES[type]}`}
      role="alert"
    >
      <span>{message}</span>

      <button
        type="button"
        onClick={onClose}
        className="ml-4 text-lg leading-none hover:opacity-80"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

// Hook for convenient usage across the application
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (
    message: string,
    type: ToastType = "info"
  ) => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}