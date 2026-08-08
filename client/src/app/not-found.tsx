import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {/* Main Card Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-4xl w-full p-8 md:p-14 relative overflow-hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Interactive Glowing Engineering Graphic (Plugs & Bulb) */}
          <div className="relative flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl p-10 border border-slate-100 group">
            
            {/* Glowing Ambient Backdrop on Hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

            {/* Interactive Glowing Bulb Element */}
            <div className="absolute top-6 right-6 transition-all duration-300 transform group-hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center shadow-inner group-hover:bg-amber-400 group-hover:shadow-[0_0_25px_rgba(251,191,36,0.8)] transition-all duration-500 cursor-pointer">
                💡
              </div>
            </div>

            {/* Disconnected Plugs / Technical Illustration */}
            <div className="relative z-10 w-full max-w-[220px] h-48 flex flex-col justify-between items-center py-2">
              {/* Top Plug Winding Down */}
              <div className="w-full flex flex-col items-start">
                <div className="w-28 h-4 border-t-2 border-l-2 border-slate-700 rounded-tl-lg" />
                <div className="w-10 h-10 bg-slate-800 rounded-lg shadow-md flex items-center justify-center text-white mt-1 ml-24">
                  🔌
                </div>
              </div>

              {/* Spark Indicators */}
              <div className="flex justify-between w-full px-6 text-blue-600 font-bold text-xs opacity-60 animate-pulse">
                <span>⚡</span>
                <span>⚡</span>
              </div>

              {/* Bottom Plug Winding Up */}
              <div className="w-full flex flex-col items-end">
                <div className="w-10 h-10 bg-slate-800 rounded-lg shadow-md flex items-center justify-center text-white mb-1 mr-24">
                  🔌
                </div>
                <div className="w-28 h-4 border-b-2 border-r-2 border-slate-700 rounded-br-lg" />
              </div>
            </div>
          </div>

          {/* Right Column: Error Text & Actions */}
          <div className="flex flex-col items-start text-left">
            <h2 className="text-6xl font-extrabold text-blue-600 tracking-tight mb-2">
              404
            </h2>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Page Not Found
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">
              We&apos;re sorry, the page you requested could not be found. Please check the URL or go back to the homepage.
            </p>

            <div className="flex flex-wrap items-center gap-3 w-full">
              <Link
                href="/"
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm text-center"
              >
                GO HOME
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

