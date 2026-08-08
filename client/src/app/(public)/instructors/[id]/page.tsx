"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Star, 
  Users, 
  BookOpen, 
  CheckSquare, 
  Clock, 
  ChevronRight 
} from "lucide-react";
import api from "@/lib/api";

// Fallback Mock Data matching the screenshots
const mockInstructor = {
  id: "sarah-chen",
  fullName: "Prof. Sarah Chen",
  specialization: "Manufacturing Engineer & CNC Specialist",
  credentials: "Stanford University",
  shortBio: "Manufacturing engineer at Stanford University with deep expertise in CNC programming, precision machining, and CAM software.",
  bio: "Prof. Sarah Chen has 16 years of combined industry and academic experience in precision manufacturing. She has collaborated with Siemens, Fanuc, and Haas Automation on next-generation machine tool development, contributing to controller firmware optimisation and toolpath algorithms. At Stanford, she directs the Advanced Manufacturing Lab and teaches graduate courses in computational manufacturing. She has trained over 18,000 students globally in CNC programming, helping machinists, engineers, and product designers bridge the gap between design intent and workshop reality.",
  avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
  stats: {
    rating: 4.8,
    students: "18,400",
    courses: 5,
    experience: "16 yrs",
    completionRate: "91%"
  },
  expertise: [
    "CNC Milling & Turning",
    "G-Code Programming",
    "CAM Software (Fusion 360)",
    "Precision Metrology",
    "Cutting Tool Selection"
  ],
  courses: [
    {
      id: "cnc-fundamentals",
      title: "CNC Programming & Machining Fundamentals",
      level: "Beginner",
      rating: 4.8,
      reviews: "5,180",
      duration: "28h",
      price: "$99",
      thumbnailUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop"
    }
  ],
  reviews: [
    { name: "Conor Murphy", date: "March 2025", rating: 5, text: "Zero machining background going in. This course got me confidently programming a Haas mill within a month. The G-code modules are incredibly detailed.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop" },
    { name: "Yuna Kim", date: "March 2025", rating: 5, text: "Prof. Chen makes complex concepts simple. The canned cycles explanation is the clearest I have seen anywhere. My shop productivity improved immediately.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop" },
    { name: "Andre Ferreira", date: "January 2025", rating: 4, text: "Excellent course overall. Would love more content on 5-axis machining, but for fundamentals this is unmatched.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop" },
    { name: "Tomasz Nowak", date: "December 2024", rating: 5, text: "The Fusion 360 CAM section alone is worth the course price. The toolpath strategies she covers match exactly what I needed on our multi-axis lathe.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" },
    { name: "Aisha Kamara", date: "November 2024", rating: 5, text: "I run a small CNC shop. Prof. Chen helped me cut setup time by 40% just by applying the work offset and canned cycle strategies from Module 2.", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1baf8a?q=80&w=100&auto=format&fit=crop" }
  ]
};

export default function InstructorProfilePage() {
  const params = useParams();
  const instructorId = params?.id as string;
  const [instructor, setInstructor] = useState<any>(null); // Defaulting to mock for visual testing
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
  async function fetchInstructor() {
    if (!instructorId) return;
    
    try {
      setIsLoading(true);
      // Calls your new Express route
      const res = await api.get(`/instructors/${instructorId}`);
      
      // Axios puts the response in res.data, and our Express controller 
      // wraps the payload in a 'data' object (res.status(200).json({ success: true, data: profile }))
      setInstructor(res.data.data);
    } catch (error) {
      console.error("Failed to fetch instructor", error);
    } finally {
      setIsLoading(false);
    }
  }
  fetchInstructor();
}, [instructorId]);

  if (isLoading) return <div className="min-h-screen bg-[#F4F9F7] flex items-center justify-center">Loading...</div>;
  if (!instructor) return <div className="min-h-screen bg-[#F4F9F7] flex items-center justify-center">Instructor not found.</div>;
  
  const lastName = instructor.fullName.split(" ").pop();

  return (
    <div className="min-h-screen bg-[#F4F9F7] flex flex-col font-sans">
      {/* 1. HERO SECTION */}
      <section className="bg-[#0A4A3A] text-white pt-12 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C2F25B_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-100/70 mb-10">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/instructors" className="hover:text-white transition-colors">Instructors</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{instructor.fullName}</span>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative bg-slate-200">
                <Image src={instructor.avatarUrl} alt={instructor.fullName} fill className="object-cover" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-[#C2F25B] text-[#0A4A3A] px-3 py-1.5 rounded-xl font-extrabold flex items-center gap-1 shadow-lg border-2 border-[#0A4A3A]">
                <Star className="w-4 h-4 fill-[#0A4A3A]" />
                {instructor.stats.rating}
              </div>
            </div>

            {/* Hero Details */}
            <div className="flex-1 space-y-4 pt-2">
              <span className="text-[#C2F25B] text-xs font-extrabold tracking-widest uppercase">Instructor Profile</span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{instructor.fullName}</h1>
              
              <div className="space-y-1">
                <p className="text-lg font-bold text-teal-50">{instructor.specialization}</p>
                <p className="text-sm text-teal-200/80">{instructor.credentials}</p>
              </div>
              
              <p className="text-sm text-teal-100 leading-relaxed max-w-2xl pt-2">
                {instructor.shortBio}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-8 pt-6 border-t border-white/10 mt-6">
                <div>
                  <p className="text-2xl font-extrabold">{instructor.stats.rating}</p>
                  <p className="text-[10px] font-bold text-teal-200/70 tracking-widest uppercase">Avg. Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{instructor.stats.students}</p>
                  <p className="text-[10px] font-bold text-teal-200/70 tracking-widest uppercase">Students Taught</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{instructor.stats.courses}</p>
                  <p className="text-[10px] font-bold text-teal-200/70 tracking-widest uppercase">Courses Published</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{instructor.stats.experience}</p>
                  <p className="text-[10px] font-bold text-teal-200/70 tracking-widest uppercase">Experience</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{instructor.stats.completionRate}</p>
                  <p className="text-[10px] font-bold text-teal-200/70 tracking-widest uppercase">Completion Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: About, Courses, Reviews */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* About Section */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#0A4A3A] mb-4">About {lastName}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {instructor.bio}
              </p>
            </div>

            {/* Published Courses */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-2xl font-extrabold text-[#0A4A3A]">Published Courses</h2>
                <span className="text-sm font-medium text-slate-500">{instructor.courses.length} course{instructor.courses.length !== 1 && 's'}</span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {instructor.courses.map((course: any) => (
                  <div key={course.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                    <div className="relative h-48">
                      <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                      <div className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-xs font-extrabold tracking-wide">
                        {course.level}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-3 line-clamp-2">{course.title}</h3>
                      
                      <div className="flex items-center gap-2 mb-4 text-sm">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                          <Star className="w-4 h-4 fill-current" />
                        </div>
                        <span className="font-extrabold text-slate-900">{course.rating}</span>
                        <span className="text-slate-400 font-medium">({course.reviews})</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-6">
                        <Clock className="w-4 h-4" /> {course.duration}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-2xl font-extrabold text-[#0A4A3A]">{course.price}</span>
                        <div className="flex gap-2">
                          <Link href={`/courses/${course.id}`} className="px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-[#196A54] hover:text-[#196A54] transition-colors">
                            View Details
                          </Link>
                          <button className="px-5 py-2 bg-[#196A54] text-white rounded-xl text-sm font-bold hover:bg-[#12503F] transition-colors">
                            Enroll
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Reviews */}
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl font-extrabold text-[#0A4A3A]">Student Reviews</h2>
                <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-3 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-extrabold text-slate-900 ml-1">{instructor.stats.rating}</span>
                  <span className="text-xs text-slate-500 font-medium ml-1">instructor rating</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {instructor.reviews.map((review: any, i: number) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                        <Image src={review.avatar} alt={review.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{review.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className={`w-3 h-3 ${idx < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Achievements, Expertise */}
          <div className="space-y-6">
            
            {/* Achievements Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-[#0A4A3A] mb-6">Achievements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F4F9F7] p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500 mb-2" />
                  <p className="text-xl font-extrabold text-slate-900">{instructor.stats.students}</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Students</p>
                </div>
                <div className="bg-[#F4F9F7] p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-xl font-extrabold text-slate-900">{instructor.stats.courses}</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Courses</p>
                </div>
                <div className="bg-[#F4F9F7] p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-emerald-500 mb-2" />
                  <p className="text-xl font-extrabold text-slate-900">{instructor.stats.completionRate}</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Completion Rate</p>
                </div>
                <div className="bg-[#F4F9F7] p-4 rounded-2xl text-center flex flex-col items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500 mb-2" />
                  <p className="text-xl font-extrabold text-slate-900">{instructor.stats.rating}</p>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Avg. Rating</p>
                </div>
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-extrabold text-[#0A4A3A] mb-6">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {instructor.expertise.map((skill: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full text-xs font-bold transition-colors hover:bg-emerald-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 3. CTA BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="bg-[#0A4A3A] rounded-[2.5rem] py-16 px-6 relative overflow-hidden text-center border-b-8 border-[#C2F25B]">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C2F25B_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-[#C2F25B] text-xs font-extrabold tracking-widest uppercase mb-4">Learn From The Best</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Start learning with {lastName} today.
            </h2>
            <p className="text-teal-100 mb-10">
              Join {instructor.stats.students} students already learning from one of the platform&apos;s highest-rated instructors.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/courses" className="w-full sm:w-auto bg-[#C2F25B] text-[#0A4A3A] px-8 py-4 rounded-xl font-extrabold hover:bg-[#b0df4e] transition-colors shadow-lg">
                Browse Courses
              </Link>
              <Link href="/register" className="w-full sm:w-auto bg-transparent border-2 border-teal-100/30 text-white px-8 py-4 rounded-xl font-extrabold hover:bg-white/10 transition-colors">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}