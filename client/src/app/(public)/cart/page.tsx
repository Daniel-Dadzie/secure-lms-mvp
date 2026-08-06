"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

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
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      const data = res.data;
      setCart(data.cart || data);
    } catch {
      setError("Failed to load your cart. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setIsLoading(false);
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
      // Cart checkout — one Paystack transaction covering all items
      const res = await api.post("/payments/checkout/cart");
      if (res.data.authorizationUrl) {
        // Redirect the browser to Paystack's hosted payment page.
        // We use window.location.href (not router.push) because this is
        // an external URL, not a Next.js route.
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Could not start checkout. Please try again.");
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
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 pb-20">
        {toast && (
          <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 w-full max-w-sm px-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
              <span>{toast}</span>
              <button type="button" onClick={() => setToast(null)} className="ml-4 text-blue-400 font-bold">✕</button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Your Cart</h1>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-pulse">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-slate-200" />
                ))}
              </div>
              <div className="h-48 rounded-xl bg-slate-200" />
            </div>
          )}

          {!isLoading && (!cart || cart.items.length === 0) && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <span className="text-5xl mb-4">🛒</span>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-sm">
                Looks like you haven&apos;t added any courses yet. Browse our catalog to find something you&apos;ll love.
              </p>
              <Link
                href="/courses"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Browse Courses
              </Link>
            </div>
          )}

          {!isLoading && cart && cart.items.length > 0 && (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500">
                    {cart.summary.itemCount} course{cart.summary.itemCount !== 1 ? "s" : ""} in your cart
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
                        sizes="160" 
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/courses/${item.course.id}`}
                          className="font-bold text-slate-900 hover:text-blue-700 transition line-clamp-2"
                        >
                          {item.course.title}
                        </Link>
                        {item.course.instructor && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.course.instructor.fullName}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(item.courseId)}
                        disabled={removingId === item.courseId}
                        className="mt-2 self-start text-xs font-semibold text-red-500 hover:text-red-700 transition disabled:opacity-50"
                      >
                        {removingId === item.courseId ? "Removing..." : "Remove"}
                      </button>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="font-bold text-slate-900">
                        {item.course.priceCents === 0
                          ? "Free"
                          : `₵${(item.course.priceCents / 100).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>

                <div className="space-y-3 text-sm border-b border-slate-100 pb-4 mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cart.summary.itemCount} items)</span>
                    <span>₵{(cart.summary.subtotalCents / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-slate-900 text-base mb-6">
                  <span>Total</span>
                  <span>₵{(cart.summary.totalCents / 100).toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? "Redirecting to payment..." : "Checkout Now"}
                </button>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Secured by Paystack
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href="/courses"
                    className="block text-center text-sm font-semibold text-blue-600 hover:underline"
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