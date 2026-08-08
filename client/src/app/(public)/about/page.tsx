"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Target, 
  Telescope, 
  Gem, 
  GraduationCap, 
  Wrench, 
  Award, 
  Calendar, 
  Rocket, 
  Bot 
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Hero Section */}
      <section className="bg-[#0A4A3A] text-white pt-20 pb-24 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">
            Empowering Engineers Worldwide
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Empowering Engineers <span className="text-emerald-400">Worldwide</span>
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Mech Spec Technologies is the world&apos;s leading LMS for mechanical and industrial engineering education — built by engineers, for engineers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/courses"
              className="bg-white hover:bg-slate-100 text-[#0A4A3A] px-6 py-3.5 rounded-xl font-bold text-xs transition-all shadow-sm"
            >
              Browse Courses
            </Link>
            <Link
              href="/register"
              className="bg-[#135249] hover:bg-[#18665b] text-white px-6 py-3.5 rounded-xl font-bold text-xs transition-all border border-emerald-600/30 shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0A4A3A]">
                Our Story
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Founded by Engineers. Built for Engineers.
              </h2>
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <p>
                  Founded in 2019 by a group of senior mechanical and industrial engineers, Mech Spec Technologies was born out of frustration with generic online learning platforms that failed to deliver the depth and rigour that technical professionals need.
                </p>
                <p>
                  Today, over 50,000 engineers in 80+ countries trust our platform to advance their careers. From new graduates to 20-year veterans, our curriculum covers every level and discipline — from CNC programming to industrial automation to fluid dynamics.
                </p>
                <p className="font-semibold text-slate-800">
                  Our mission is simple: make world-class engineering education accessible to everyone, everywhere.
                </p>
              </div>
            </div>

            <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
              <Image
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop"
                alt="Engineer working"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission, Vision & Values + Stats Section */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0A4A3A]">
              What Drives Us
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Mission, Vision & Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold border border-emerald-100 group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Target className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Our Mission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To democratise high-quality engineering education by providing affordable, industry-relevant courses taught by world-class practitioners.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold border border-emerald-100 group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Telescope className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Our Vision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A world where every engineer has access to the knowledge and skills needed to solve the greatest technical challenges of our time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold border border-emerald-100 group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Gem className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Our Values</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rigour, integrity, inclusion and continuous improvement. We hold ourselves to the same professional standards we teach.
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-6">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0A4A3A]">50k+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Students Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0A4A3A]">200+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Expert Instructors</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0A4A3A]">500+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Courses Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0A4A3A]">98%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Engineers Choose Mech Spec */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0A4A3A]">
              Why Us?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Engineers Choose Mech Spec
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <GraduationCap className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Industry Experts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                200+ vetted instructors with 10+ years of real engineering experience.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Wrench className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Hands-on Projects</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build a portfolio through real-world simulations and capstone projects.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Award className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Pro Certificates</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Earn WCQA-accredited certificates recognised by employers globally.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Calendar className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Flexible Learning</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learn at your own pace — mobile, tablet, desktop. Offline access included.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Rocket className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Career Advancement</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Graduates land roles at Boeing, Tesla, Siemens, GE and 500+ partners.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0A4A3A] flex items-center justify-center font-bold group-hover:bg-[#0A4A3A] group-hover:text-white transition-all">
                <Bot className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-base text-slate-900">FAQ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Personalised AI tutor available 24/7 to guide your learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Leadership / Meet the Team Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0A4A3A]">
              Leadership
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Meet the Team
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Dr. James Walker", role: "Head of Curriculum", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" },
              { name: "Prof. Sarah Chen", role: "Lead Instructor, CAD", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop" },
              { name: "Emily Torres", role: "Robotics Programme Lead", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" },
              { name: "Dr. Kwame Osei", role: "Director of Automation", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
            ].map((member, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center space-y-4 group hover:border-emerald-200 hover:shadow-md transition-all">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-emerald-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Image src={member.img} alt={member.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{member.name}</h3>
                  <p className="text-xs font-semibold text-[#0A4A3A] mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trusted Employers Pills */}
          <div className="pt-12 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Trusted by Top Engineering Employers
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Boeing', 'Tesla', 'Siemens', 'General Electric', 'Lockheed Martin', 'Caterpillar', 'ABB', 'Honeywell'].map((company) => (
                <span key={company} className="bg-white px-5 py-2.5 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-slate-200/80 hover:border-[#0A4A3A] hover:text-[#0A4A3A] transition-all">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Bottom CTA Banner */}
      <section className="bg-[#0A4A3A] text-white py-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest">
            Join 50,000+ engineers worldwide
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Ready to Advance Your Engineering Career?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
            Access 500+ courses, earn certificates, and land your dream engineering role.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/courses"
              className="bg-white hover:bg-slate-100 text-[#0A4A3A] px-6 py-3.5 rounded-xl font-bold text-xs transition-all shadow-sm"
            >
              Browse Courses
            </Link>
            <Link
              href="/register"
              className="bg-[#135249] hover:bg-[#18665b] text-white px-6 py-3.5 rounded-xl font-bold text-xs transition-all border border-emerald-600/30 shadow-sm"
            >
              Get Started — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}