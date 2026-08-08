"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { 
  Search, 
  Wrench, 
  Cpu, 
  Factory, 
  Flame, 
  Zap, 
  Bot, 
  Droplets, 
  ShieldCheck, 
  PenTool, 
  Terminal, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import CtaBanner from "@/components/shared/CtaBanner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  courseCount: number;
}

const iconMap: Record<string, any> = {
  "mechanical-engineering": Wrench,
  "autocad": PenTool,
  "solidworks": Cpu,
  "cnc-programming": Terminal,
  "robotics": Bot,
  "fluid-mechanics": Droplets,
  "thermodynamics": Flame,
  "manufacturing": Factory,
  "industrial-automation": Zap,
  "quality-control": ShieldCheck,
  "electrical-engineering": Zap,
  "welding-technology": Flame,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/categories").catch(() => ({
          data: {
            categories: [
              { id: "1", name: "Mechanical Engineering", slug: "mechanical-engineering", description: "Core systems, statics, dynamics & machine design", courseCount: 48 },
              { id: "2", name: "AutoCAD", slug: "autocad", description: "2D & 3D computer-aided design fundamentals", courseCount: 31 },
              { id: "3", name: "SolidWorks", slug: "solidworks", description: "Parametric 3D modelling & assembly design", courseCount: 25 },
              { id: "4", name: "CNC Programming", slug: "cnc-programming", description: "G-code, tooling & machining fundamentals", courseCount: 32 },
              { id: "5", name: "Robotics", slug: "robotics", description: "Industrial robots, kinematics & control systems", courseCount: 24 },
              { id: "6", name: "Fluid Mechanics", slug: "fluid-mechanics", description: "Hydraulics, pneumatics & CFD analysis", courseCount: 18 },
              { id: "7", name: "Thermodynamics", slug: "thermodynamics", description: "Heat transfer, energy systems & cycles", courseCount: 15 },
              { id: "8", name: "Manufacturing", slug: "manufacturing", description: "Lean, Six Sigma, production & process", courseCount: 29 },
              { id: "9", name: "Industrial Automation", slug: "industrial-automation", description: "PLCs, SCADA, DCS & control systems", courseCount: 21 },
              { id: "10", name: "Quality Control", slug: "quality-control", description: "GD&T, QMS, ISO standards & inspection", courseCount: 15 },
              { id: "11", name: "Electrical Engineering", slug: "electrical-engineering", description: "Circuits, power systems & electronics for MEs", courseCount: 19 },
              { id: "12", name: "Welding Technology", slug: "welding-technology", description: "MIG, TIG, arc welding & weld inspection", courseCount: 12 },
            ]
          }
        }));
        setCategories(res.data?.categories || res.data || []);
      } catch (err) {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero with Search Bar Embedded Inside */}
      <PageHero 
        badge="Explore Topics" 
        title="Browse by Category" 
        subtitle="Find courses in your area of engineering expertise. 12 specialised disciplines to choose from." 
      >
        <div className="relative mt-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-slate-200 shadow-sm transition-all"
          />
        </div>
      </PageHero>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-6 flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>{filteredCategories.length} categories found</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = iconMap[category.slug] || BookOpen;
              return (
                <Link
                  key={category.id}
                  href={`/courses?category=${category.slug}`}
                  className="group bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-600/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center group-hover:bg-[#0A4A3A] group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0A4A3A] transition-colors">{category.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{category.description}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{category.courseCount} courses</span>
                    <span className="text-xs font-bold text-[#0A4A3A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Browse</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No categories found</h3>
          </div>
        )}

        <CtaBanner 
          badge="Teach With Us"
          title="Not sure where to start?"
          description="Take our free skills assessment and get a personalised engineering learning path tailored to your professional level."
          buttonText="Get Started Free"
          buttonHref="/register"
        />
      </main>
    </div>
  );
}