"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/api";
import { Search, Star } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import CtaBanner from "@/components/shared/CtaBanner";

interface Instructor {
  id: string;
  slug: string;
  fullName: string;
  specialization: string;
  credentials: string;
  avatarUrl: string;
  rating: number;
  studentsCount: string;
  coursesCount: number;
  experienceYears: string;
  category: string;
}

const CATEGORIES = [
  "All", "General", "Mechanical", "CAD", "Robotics", "Automation",
  "Fluid", "Thermal", "Electrical", "Quality",
];

const FALLBACK_AVATAR = "/images/avatar-fallback.jpg";

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/instructors");
        setInstructors(res.data.data || []);
      } catch (err) {
        console.error("Error fetching instructors:", err);
        setInstructors([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch = inst.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.credentials.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || inst.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from actual instructors
  const availableCategories = Array.from(new Set(instructors.map(inst => inst.category)));
  const categoriesToDisplay = CATEGORIES.filter(cat => cat === "All" || availableCategories.includes(cat));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Clean Hero Without Overlap */}
      <PageHero
        badge="World-Class Educators"
        title="Meet Our Instructors"
        subtitle="Learn from 200+ engineers with deep industry experience at Boeing, Tesla, NASA, Siemens, and beyond."
      />

      {/* Sticky Search & Filter Bar Section */}
      <div className="sticky top-20 z-30 bg-slate-50/90 backdrop-blur-md py-4 border-b border-slate-200/60 shadow-sm transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search instructors..."
                className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0A4A3A]/20 border border-slate-200 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
              {categoriesToDisplay.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-[#0A4A3A] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-[#0A4A3A] border border-slate-200/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instructors Grid Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredInstructors.map((inst) => (
              <div key={inst.id} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#0A4A3A]/40 transition-all flex flex-col justify-between text-center space-y-6 group">
                <div className="space-y-4">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-100 shadow-inner relative bg-slate-100">
                      <Image src={inst.avatarUrl || FALLBACK_AVATAR} alt={inst.fullName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-[#0A4A3A] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{inst.rating}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0A4A3A] transition-colors">{inst.fullName}</h3>
                    <p className="text-xs font-semibold text-[#0A4A3A] mt-0.5">{inst.specialization}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{inst.credentials}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-100 text-slate-600">
                  <div><p className="font-bold text-slate-900 text-sm">{inst.studentsCount}</p><p className="text-[10px] text-slate-400 font-medium">Students</p></div>
                  <div className="border-x border-slate-100"><p className="font-bold text-slate-900 text-sm">{inst.coursesCount}</p><p className="text-[10px] text-slate-400 font-medium">Courses</p></div>
                  <div><p className="font-bold text-slate-900 text-sm">{inst.experienceYears}</p><p className="text-[10px] text-slate-400 font-medium">Exp.</p></div>
                </div>

                <Link href={`/instructors/${inst.slug}`} className="w-full border-2 border-slate-200 text-slate-700 hover:border-[#196A54] hover:text-[#196A54] py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center transition-all">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No instructors found</h3>
          </div>
        )}

        <CtaBanner
          badge="Teach With Us"
          title="Are You an Engineering Expert?"
          description="Join our global network of instructors. Earn revenue teaching what you know best."
          buttonText="Apply to Teach"
          buttonHref="/register?role=INSTRUCTOR"
        />
      </main>
    </div>
  );
}
