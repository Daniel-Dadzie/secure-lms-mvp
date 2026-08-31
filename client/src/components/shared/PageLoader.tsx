// client/src/components/shared/PageLoader.tsx
export default function PageLoader({ text = "Loading application..." }: { text?: string }) {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center bg-slate-50 px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-emerald-100 opacity-75" />
        
        {/* Inner branded spinner */}
        <div className="relative h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#196A54]" />
      </div>
      
      <p className="mt-6 text-sm font-semibold tracking-wide text-slate-600 animate-pulse">
        {text}
      </p>
    </div>
  );
}