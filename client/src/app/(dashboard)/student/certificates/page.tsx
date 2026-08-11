"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Award, Download, Printer, Share2, ArrowLeft, CheckCircle2 } from "lucide-react";

interface CertificateItem {
  id: string;
  courseTitle: string;
  instructorName: string;
  completedAt: string;
  certificateId: string;
  hours: number;
  distinction: string;
}

export default function CertificatesPage() {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("courseId");

  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/enrollments");
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.enrollments) ? raw.enrollments : [];

        // Filter only completed courses and map them to certificates
        const earnedCerts: CertificateItem[] = list
          .filter((e: any) => e.status === "COMPLETED")
          .map((e: any, index: number) => ({
            id: e.course.id,
            courseTitle: e.course.title,
            instructorName: e.course.instructor?.fullName || "Expert Instructor",
            completedAt: new Date(e.updatedAt || e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            certificateId: `MST-LMS-2026-${1000 + index}`,
            hours: parseInt(e.course.duration) || 40,
            distinction: "Distinction",
          }));

        setCertificates(earnedCerts);

        if (courseParam) {
          const match = earnedCerts.find(c => c.id === courseParam);
          if (match) setSelectedCert(match);
        }
      } catch (err) {
        console.error("Failed to load certificates:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, [courseParam]);

  const handleDownload = () => {
    showToast("Preparing certificate PDF download...");
    setTimeout(() => window.print(), 800);
  };

  const handleShare = async () => {
    const shareData = {
      title: "Verified Certificate",
      text: `Check out my verified certificate for ${selectedCert?.courseTitle} from Mech Spec Technologies LMS!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share canceled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Certificate link copied to clipboard!");
    }
  };

  if (selectedCert) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 relative">
        {toastMessage && (
          <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 bg-[#115e59] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xl">
            {toastMessage}
          </div>
        )}

        <button
          onClick={() => setSelectedCert(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </button>

        <div className="bg-white border-2 border-slate-800 rounded-3xl p-10 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#0a3832_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="flex justify-center items-center space-x-2 text-[#0a3832]">
            <Award className="w-10 h-10" />
            <span className="font-extrabold tracking-widest text-sm uppercase">Mech Spec Technologies LMS</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Certificate of Completion</p>
            <h2 className="text-3xl font-serif text-slate-900">This is to certify that</h2>
            <p className="text-2xl font-bold font-serif text-[#0a3832] underline decoration-slate-300 underline-offset-8">
              Student User
            </p>
            <p className="text-sm text-slate-500 pt-2">has successfully completed the course module</p>
          </div>

          <div className="py-4 px-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto max-w-lg">
            <h3 className="text-xl font-bold text-slate-900">{selectedCert.courseTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">Instructed by {selectedCert.instructorName} • {selectedCert.hours} Hours</p>
          </div>

          <div className="flex justify-around items-center pt-6 border-t border-slate-100 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-900">{selectedCert.distinction}</p>
              <p className="text-[10px] text-slate-400">Achievement Level</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Credential</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">{selectedCert.completedAt}</p>
              <p className="text-[10px] text-slate-400">Date Issued</p>
            </div>
          </div>

          <p className="text-[10px] font-mono text-slate-400 pt-4">Certificate ID: {selectedCert.certificateId}</p>
        </div>

        <div className="flex justify-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={handleDownload} className="flex items-center gap-2 bg-[#0a3832] hover:bg-[#0f4a42] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Share2 className="w-4 h-4" />
            <span>Share Certificate</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Certificates</h1>
        <p className="text-xs text-slate-500 mt-1">{certificates.length} verified certificates earned</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0a3832] flex items-center justify-center font-bold flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{cert.courseTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instructor: {cert.instructorName} • Completed: {cert.completedAt} • {cert.hours} hours • {cert.distinction}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{cert.certificateId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  View
                </button>
                <button
                  onClick={() => { setSelectedCert(cert); setTimeout(handleDownload, 200); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Complete your active engineering courses to unlock verified completion certificates.</p>
        </div>
      )}
    </div>
  );
}