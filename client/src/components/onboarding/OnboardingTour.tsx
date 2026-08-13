"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import type { OnboardingStep } from "@/config/onboardingSteps";
import { isOnboardingCompleted, markOnboardingCompleted } from "@/lib/onboarding";

interface OnboardingTourProps {
  userId: string;
  role: "STUDENT" | "INSTRUCTOR";
  steps: OnboardingStep[];
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measureTourTarget(tourTarget?: string): TargetRect | null {
  if (!tourTarget) return null;
  const el = document.querySelector(`[data-tour-id="${tourTarget}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

export function OnboardingTour({ userId, role, steps }: OnboardingTourProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  function finish() {
    markOnboardingCompleted(userId, role);
    setVisible(false);
  }

  useEffect(() => {
    if (!userId || isOnboardingCompleted(userId, role)) return;
    const timer = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(timer);
  }, [userId, role]);

  useEffect(() => {
    if (!visible) return;

    function syncTargetRect() {
      setTargetRect(measureTourTarget(step?.tourTarget));
    }

    const frame = window.requestAnimationFrame(syncTargetRect);
    window.addEventListener("resize", syncTargetRect);
    window.addEventListener("scroll", syncTargetRect, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncTargetRect);
      window.removeEventListener("scroll", syncTargetRect, true);
    };
  }, [visible, stepIndex, step?.tourTarget]);

  if (!visible || !step) return null;

  function goNext() {
    if (isLast) {
      finish();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function handleCta() {
    if (step.href) {
      router.push(step.href);
    }
    if (!isLast) {
      setStepIndex((i) => i + 1);
    } else {
      finish();
    }
  }

  const padding = 6;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[1px]" onClick={finish} />

      {targetRect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-[#C2F25B] ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.55)] transition-all duration-300"
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
          }}
        />
      )}

      <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-[#196A54]">
              <Sparkles className="h-5 w-5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Step {stepIndex + 1} of {steps.length}
              </span>
            </div>
            <button
              type="button"
              onClick={finish}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Skip tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 id="onboarding-title" className="text-lg font-extrabold text-slate-900">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>

          <div className="mt-4 flex gap-1">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-[#196A54]" : "bg-slate-200"}`}
              />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={finish}
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              Skip tour
            </button>
            <div className="ml-auto flex gap-2">
              {step.href && (
                <button
                  type="button"
                  onClick={handleCta}
                  className="rounded-xl border border-[#196A54] px-4 py-2 text-xs font-bold text-[#196A54] hover:bg-emerald-50"
                >
                  {step.ctaLabel ?? "Go there"}
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1 rounded-xl bg-[#196A54] px-4 py-2 text-xs font-bold text-white hover:bg-[#12503F]"
              >
                {isLast ? "Finish" : "Next"}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isLast && step.href && (
            <p className="mt-3 text-center text-xs text-slate-400">
              Or{" "}
              <Link href={step.href} onClick={finish} className="font-semibold text-[#196A54] hover:underline">
                jump straight there
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
