"use client";

import Image from "next/image";
import Link from "next/link";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";

export default function HomePage() {
  return (
    <div className="w-full bg-[#F4F9F7]">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center pt-20 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1920"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A4A3A]/95 via-[#0A4A3A]/88 to-[#196A54]/75" />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(#196A54 2px, transparent 2px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl w-full relative z-10">
          <div className="max-w-3xl">
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6 drop-shadow-lg">
              Master Practical <br/>
              <span className="text-[#C2F25B]">Engineering Skills</span>
            </h1>
            
            <ul className="space-y-4 mb-10 text-lg text-teal-50 font-medium max-w-xl drop-shadow-md">
              <li className="flex items-center gap-3">
                <svg className="h-6 w-6 text-[#C2F25B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Build real-world skills through hands-on projects
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-6 w-6 text-[#C2F25B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Earn professional certificates employers recognise
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-6 w-6 text-[#C2F25B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Advance your career with industry expert instructors
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-[#196A54] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search courses, skills or instructors..." 
                  className="w-full pl-11 pr-4 py-4 rounded-xl text-slate-900 outline-none shadow-xl focus:ring-4 focus:ring-[#C2F25B]/50 transition-all border-none bg-white/95 focus:bg-white backdrop-blur-sm"
                />
              </div>
              <Link
                href="/courses"
                className="bg-[#196A54] hover:bg-[#12503F] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all border border-transparent hover:border-white/20 whitespace-nowrap text-center"
              >
                Browse Courses
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white font-medium drop-shadow-md">
              <span className="text-teal-100/90">Popular:</span>
              {['CNC Programming', 'SolidWorks', 'AutoCAD', 'Robotics'].map((tag, idx) => (
                <span key={idx} className="px-4 py-1.5 rounded-full border border-white/30 hover:bg-white/20 hover:border-white/50 cursor-pointer transition-all backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-20 md:mt-32 pt-8 sm:pt-10 border-t border-white/20 backdrop-blur-sm relative z-10">
            {[
              { num: "50k+", label: "Active Students" },
              { num: "200+", label: "Expert Instructors" },
              { num: "500+", label: "Technical Courses" },
              { num: "98%", label: "Completion Rate" }
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left drop-shadow-lg">
                <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.num}</h3>
                <p className="text-teal-100/90 font-medium tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. BROWSE BY CATEGORY */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-sm font-bold text-[#196A54] tracking-wider uppercase mb-2">Explore Topics</p>
            <h2 className="text-4xl font-extrabold text-[#0A4A3A]">Browse by Category</h2>
            <p className="text-slate-500 mt-2 text-lg">Find courses in your area of engineering interest</p>
          </div>
          <Link href="/categories" className="hidden md:flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-full font-bold text-slate-700 hover:border-[#196A54] hover:text-[#196A54] transition-colors">
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Mechanical Engineering", desc: "Core systems & dynamics", count: "48", bg: "bg-teal-50", text: "text-teal-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            },
            { 
              title: "CAD & SolidWorks", desc: "3D modelling & design", count: "56", bg: "bg-orange-50", text: "text-orange-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            },
            { 
              title: "CNC Programming", desc: "Tooling & G-code", count: "32", bg: "bg-blue-50", text: "text-blue-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            },
            { 
              title: "Robotics & Automation", desc: "Industrial robots", count: "24", bg: "bg-purple-50", text: "text-purple-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            },
            { 
              title: "Fluid Mechanics", desc: "Hydraulics & CFD", count: "18", bg: "bg-cyan-50", text: "text-cyan-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            },
            { 
              title: "Manufacturing", desc: "Lean & Six Sigma", count: "29", bg: "bg-yellow-50", text: "text-yellow-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            },
            { 
              title: "Industrial Systems", desc: "PLCs & SCADA", count: "21", bg: "bg-red-50", text: "text-red-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            },
            { 
              title: "Quality Control", desc: "GD&T & QMS", count: "15", bg: "bg-green-50", text: "text-green-600",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            },
          ].map((cat, i) => (
            <Link key={i} href="#" className={`group rounded-2xl p-6 ${cat.bg} hover:shadow-lg transition-all border border-transparent hover:border-[#196A54]/20 cursor-pointer`}>
              <div className={`mb-4 w-10 h-10 ${cat.text}`}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  {cat.icon}
                  {cat.title === "Mechanical Engineering" && <circle cx="12" cy="12" r="3" />}
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{cat.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{cat.desc}</p>
              <p className="text-sm font-semibold text-[#196A54] group-hover:translate-x-1 transition-transform inline-block">
                {cat.count} courses →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED COURSES */}
      <FeaturedCoursesSection />

      {/* 4. WHY CHOOSE MECH SPEC */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <p className="text-sm font-bold text-[#196A54] tracking-wider uppercase mb-2">Platform Features</p>
        <h2 className="text-4xl font-extrabold text-[#0A4A3A] mb-4">Why Choose Mech Spec</h2>
        <p className="text-slate-500 text-lg mb-16">A comprehensive platform designed for modern engineering professionals.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, 
              title: "Industry Experts", 
              desc: "Learn from professionals with 10+ years of real engineering experience." 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />, 
              title: "Hands-on Projects", 
              desc: "Build a portfolio through real-world simulations and capstone projects." 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />, 
              title: "Pro Certificates", 
              desc: "Earn accredited certificates recognised by employers globally upon completion." 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, 
              title: "Flexible Learning", 
              desc: "Learn at your own pace across all devices. Offline access included." 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />, 
              title: "Career Advancement", 
              desc: "Our alumni network includes engineers at leading manufacturing firms." 
            },
            { 
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />, 
              title: "Active Community", 
              desc: "Join thousands of engineers in our forums to collaborate and share projects." 
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-default">
              <div className="bg-[#F4F9F7] text-[#196A54] w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#196A54] group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 transform group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. POPULAR INSTRUCTORS */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-sm font-bold text-[#196A54] tracking-wider uppercase mb-2">Learn from the best</p>
              <h2 className="text-4xl font-extrabold text-[#0A4A3A]">Popular Instructors</h2>
              <p className="text-slate-500 mt-2 text-lg">World-class engineers who have taught 40,000+ students</p>
            </div>
            <Link href="/instructors" className="hidden md:flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-full font-bold text-slate-700 hover:border-[#196A54] hover:text-[#196A54] transition-colors">
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: "james-walker", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80", name: "Dr. James Walker", role: "Mechanical Systems", exp: "15 yrs", rating: "4.9", students: "12.4k" },
              { id: "sarah-chen", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80", name: "Prof. Sarah Chen", role: "CAD / CAM Specialist", exp: "12 yrs", rating: "4.8", students: "9.8k" },
              { id: "emily-torres", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80", name: "Emily Torres", role: "CNC & Robotics", exp: "10 yrs", rating: "4.9", students: "8.2k" },
              { id: "kwame-osei", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80", name: "Dr. Kwame Osei", role: "Industrial Automation", exp: "18 yrs", rating: "4.8", students: "6.5k" },
            ].map((instructor, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-xl transition-shadow group">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-4 border-[#F4F9F7] animate-pulse bg-slate-200">
                  <Image 
                    src={instructor.img} 
                    alt={instructor.name} 
                    fill 
                    sizes="96px"
                    className="object-cover group-hover:scale-110 transition-transform" 
                    onLoad={(e) => {
                      const target = e.target as HTMLElement;
                      target.parentElement?.classList.remove('animate-pulse');
                    }}
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{instructor.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{instructor.role}</p>
                
                <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-600 mb-6">
                  <span>{instructor.exp}</span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {instructor.rating}
                  </div>
                  <span className="text-slate-300">•</span>
                  <span>{instructor.students}</span>
                </div>
                
                {/* Updated to Link targeting the instructor profile */}
                <Link 
                  href={`/instructors/${instructor.id}`}
                  className="block w-full text-center py-2.5 border-2 border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:border-[#196A54] hover:text-[#196A54] transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <p className="text-sm font-bold text-[#196A54] tracking-wider uppercase mb-2">Success Stories</p>
        <h2 className="text-4xl font-extrabold text-[#0A4A3A] mb-4">What Our Students Say</h2>
        <p className="text-slate-500 text-lg mb-16">Real results from engineers who advanced their careers</p>

        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            { quote: "The Advanced Mechanical Systems course provided exactly the technical depth I needed. The curriculum is industry-relevant and the instructors are highly knowledgeable.", initials: "AR", name: "Alex Rivera", role: "Mechanical Engineer", course: "Advanced Mechanical Systems Design" },
            { quote: "I improved my CNC programming skills significantly in just 6 months. The practical assignments and real-world simulations made all the difference on the factory floor.", initials: "PP", name: "Priya Patel", role: "CNC Programmer", course: "CNC Programming Fundamentals" },
            { quote: "Mech Spec has an outstanding robotics curriculum. The hands-on capstone projects and expert feedback kept me on track every step of the way.", initials: "MJ", name: "Marcus Johnson", role: "Robotics Technician", course: "Industrial Robotics & Automation" },
          ].map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                   <svg key={star} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 flex-1">&quot;{testimonial.quote}&quot;</p>
              
              <div className="bg-[#F4F9F7] text-xs font-semibold text-[#196A54] px-3 py-2 rounded mb-6 flex items-center gap-2 w-max">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Completed: {testimonial.course}
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-6 mt-auto">
                <div className="w-10 h-10 rounded-full bg-[#0A4A3A] flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA & LOGOS SECTION */}
      {/* Removed the border-t-8 border-[#C2F25B] from the section container */}
      <section className="bg-[#0A4A3A] relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#196A54]/40 via-transparent to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-20">
            <p className="text-xs font-bold text-teal-100/60 tracking-widest uppercase mb-8">Join students from leading industrial firms</p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Boeing', 'Tesla', 'Siemens', 'General Electric', 'Lockheed Martin', 'Caterpillar', 'ABB', 'Honeywell'].map((company, i) => (
                <div key={i} className="bg-white px-6 py-3 rounded-xl shadow-sm text-sm font-extrabold text-slate-700 hover:bg-slate-50 cursor-default transition-colors">
                  {company}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Start Your Engineering Career Today
            </h2>
            <p className="text-xl text-teal-50 mb-10">
              Access technical courses, earn certificates, and advance your engineering knowledge.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/courses" className="bg-white text-[#0A4A3A] px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg">
                Browse Courses
              </Link>
              <Link href="/register" className="bg-[#196A54] border border-[#196A54] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#12503F] hover:border-[#12503F] transition-colors shadow-lg">
                Create Free Account
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}