"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { detectTimezone } from "@/lib/detectTimezone";
import { formatPrice, formatPriceInUSD } from "@/lib/currency";

const FALLBACK_IMAGE = "/images/course-fallback.jpg";

interface CartCourse {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  priceCents: number;
  instructor?: { fullName: string };
}

interface CartItem {
  id: string;
  courseId: string;
  course: CartCourse;
}

interface Cart {
  id: string;
  items: CartItem[];
  summary: {
    itemCount: number;
    subtotalCents: number;
    totalCents: number;
  };
}

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCart = async () => {
    setIsCartLoading(true);
    try {
      const res = await api.get("/cart");
      const data = res.data;
      setCart(data.cart || data);
    } catch {
      setError("Failed to load your cart. Please refresh the page.");
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setTimeout(() => {
      void fetchCart();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  const handleRemove = async (courseId: string) => {
    setRemovingId(courseId);
    try {
      await api.delete(`/cart/items/${courseId}`);
      await fetchCart();
      showToast("Course removed from cart.");
    } catch {
      showToast("Could not remove course. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const timezone = detectTimezone();
      const res = await api.post("/payments/checkout/cart", timezone ? { timezone } : {});
      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message ||
          "Could not start checkout. Please try again."
      );
      setIsCheckingOut(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await api.delete("/cart");
      await fetchCart();
      showToast("Cart cleared.");
    } catch {
      showToast("Could not clear cart. Please try again.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-slate-50">
        {toast && (
          <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 items-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-4 font-bold text-slate-300 hover:text-white"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        )}
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
            Your Cart
          </h1>
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Professional Skeleton Loader */}
          {isCartLoading && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
                  >
                    <div className="h-20 w-32 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 w-3/4 rounded bg-slate-200" />
                      <div className="h-3 w-1/2 rounded bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-64 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse space-y-4">
                <div className="h-6 w-1/3 rounded bg-slate-200" />
                <div className="h-10 rounded-xl bg-slate-200" />
                <div className="h-12 rounded-xl bg-slate-200" />
              </div>
            </div>
          )}

          {!isCartLoading && (!cart || cart.items.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <span className="mb-4 text-5xl" aria-hidden="true">
                🛒
              </span>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                Your cart is empty
              </h2>
              <p className="mb-8 max-w-sm text-sm text-slate-500">
                Looks like you haven&apos;t added any courses yet. Browse our
                dashboard to find something you&apos;ll love.
              </p>
              <Link
                href="/student/dashboard"
                className="rounded-lg bg-[#196A54] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#12503F]"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {!isCartLoading && cart && cart.items.length > 0 && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart items */}
              <div className="space-y-4 lg:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {cart.summary.itemCount} course
                    {cart.summary.itemCount !== 1 ? "s" : ""} in your cart
                  </p>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={item.course.thumbnailUrl || FALLBACK_IMAGE}
                        alt={item.course.title}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/courses/${item.course.id}`}
                          className="line-clamp-2 font-bold text-slate-900 transition hover:text-[#196A54]"
                        >
                          {item.course.title}
                        </Link>
                        {item.course.instructor && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.course.instructor.fullName}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.courseId)}
                        disabled={removingId === item.courseId}
                        className="mt-2 self-start text-xs font-semibold text-red-500 transition hover:text-red-700 disabled:opacity-50"
                      >
                        {removingId === item.courseId
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-bold text-slate-900">
                        {formatPrice(item.course.priceCents)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="sticky top-24 h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-bold text-slate-900">
                  Order Summary
                </h2>
                <div className="mb-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Subtotal ({cart.summary.itemCount} items)
                    </span>
                    <span>
                      {formatPriceInUSD(cart.summary.subtotalCents)}
                    </span>
                  </div>
                </div>
                <div className="mb-6 flex justify-between text-base font-bold text-slate-900">
                  <span>Total (USD)</span>
                  <span>
                    {formatPriceInUSD(cart.summary.totalCents)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 text-center mb-6">
                  * Prices displayed in USD for reference. Payment will be processed in Ghana Cedis (GHS).
                </p>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full rounded-xl bg-[#196A54] py-3.5 font-bold text-white shadow-sm transition hover:bg-[#12503F] disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  {isCheckingOut
                    ? "Redirecting to payment..."
                    : "Checkout Now"}
                </button>
                <p className="mt-4 text-center text-xs text-slate-400">
                  Secured by Paystack
                </p>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <Link
                    href="/student/courses"
                    className="block text-center text-sm font-semibold text-[#196A54] hover:underline"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}