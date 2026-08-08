import { ReactNode } from "react"; // or standard React types

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export default function PageHero({ badge, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="bg-[#0A4A3A] text-white pt-16 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
        {badge && (
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 bg-[#135249] px-3 py-1 rounded-full">
            {badge}
          </span>
        )}
        <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight">{title}</h1>
        <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto">{subtitle}</p>
        
        {/* Optional children container for search bars inside hero */}
        {children && <div className="pt-4 max-w-xl mx-auto">{children}</div>}
      </div>
    </section>
  );
}