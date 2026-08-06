export default function FloatingAssistant() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        
        {/* Main Chat Button */}
        <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0A4A3A] text-white shadow-2xl hover:bg-[#12503F] transition-all hover:scale-105">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        
        {/* Lime Green Online Indicator */}
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F4F9F7]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#C2F25B]"></span>
        </span>

      </div>
    </div>
  );
}