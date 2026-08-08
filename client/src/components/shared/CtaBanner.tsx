import Link from "next/link";

interface CtaBannerProps {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export default function CtaBanner({ badge, title, description, buttonText, buttonHref }: CtaBannerProps) {
  return (
    <div className="mt-20 bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm relative overflow-hidden space-y-4">
      <span className="text-xs font-bold uppercase tracking-widest text-[#0A4A3A] bg-emerald-50 px-3 py-1 rounded-full">
        {badge}
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">{description}</p>
      <div className="pt-2">
        <Link href={buttonHref} className="inline-flex items-center justify-center bg-[#0A4A3A] hover:bg-[#12503F] text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-sm">
          {buttonText}
        </Link>
      </div>
    </div>
  );
}

