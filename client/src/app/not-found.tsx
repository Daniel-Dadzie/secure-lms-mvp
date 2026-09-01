// import Link from "next/link";

// export default function NotFound() {
//   return (
//     <div className="flex min-h-screen flex-col bg-slate-50">
//       <header className="border-b border-slate-200 bg-white">
//         <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
//           <Link href="/" className="text-lg font-extrabold text-[#196A54]">
//             Mech Spec Technologies
//           </Link>
//         </div>
//       </header>

//       <main className="flex flex-1 items-center justify-center px-4 py-12">
//         <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
//           <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-3xl font-black text-[#196A54]">
//             404
//           </div>
          
//           <h1 className="mb-3 text-3xl font-extrabold text-slate-900">
//             Page Not Found
//           </h1>
          
//           <p className="mb-8 text-sm leading-relaxed text-slate-600">
//             We&apos;re sorry, the page you requested could not be found. Please check the URL or return to your dashboard.
//           </p>

//           <Link
//             href="/"
//             className="inline-flex rounded-xl bg-[#196A54] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#12503F]"
//           >
//             Go to Homepage →
//           </Link>
//         </div>
//       </main>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-extrabold text-[#196A54]">
            Mech Spec Technologies
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-lg shadow-slate-100">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-emerald-50 text-4xl font-black text-[#196A54] tracking-wider">
            404
          </div>
          
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            Oops! Lost in the syllabus?
          </h1>
          
          <p className="mb-8 text-sm leading-relaxed text-slate-600">
            The page or course you are looking for has been moved, removed, or never existed. Try searching for your course below to jump right back on track.
          </p>

          <form onSubmit={handleSearch} className="mb-8 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses (e.g. Java, Python, Web)..."
              className="flex-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#196A54] focus:ring-2 focus:ring-emerald-100 transition"
            />
            <button
              type="submit"
              className="rounded-xl w-full sm:w-auto bg-[#196A54] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12503F] shrink-0"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
            <span>Quick links:</span>
            <Link href="/courses" className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-emerald-50 hover:text-[#196A54] transition">
              All Courses
            </Link>
            <Link href="/student/my-learning" className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-emerald-50 hover:text-[#196A54] transition">
              My Learning
            </Link>
            <Link href="/cart" className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-emerald-50 hover:text-[#196A54] transition">
              Cart
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}