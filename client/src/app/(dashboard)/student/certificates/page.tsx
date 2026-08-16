"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Award, Download, Printer, Share2, ArrowLeft, CheckCircle2 } from "lucide-react";

interface CertificateItem {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  completedAt: string;
  certificateId: string;
  thumbnailUrl: string | null;
}

function CertificatesContent() {
  const searchParams = useSearchParams();
  const courseParam = searchParams.get("courseId");
  const { user } = useAuthStore();

  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchCertificates() {
      setIsLoading(true);
      try {
        const res = await api.get("/progress/certificates");
        if (cancelled) return;

        const list = res.data.certificates ?? res.data ?? [];
        const earnedCerts: CertificateItem[] = list.map((cert: {
          id: string;
          certificateNumber: string;
          issuedAt: string;
          course: {
            id: string;
            title: string;
            thumbnailUrl: string | null;
            instructor?: { fullName: string };
          };
        }) => ({
          id: cert.id,
          courseId: cert.course.id,
          courseTitle: cert.course.title,
          instructorName: cert.course.instructor?.fullName || "Expert Instructor",
          completedAt: new Date(cert.issuedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          certificateId: cert.certificateNumber,
          thumbnailUrl: cert.course.thumbnailUrl,
        }));

        setCertificates(earnedCerts);

        if (courseParam) {
          const match = earnedCerts.find((c) => c.courseId === courseParam);
          if (match) setSelectedCert(match);
        }
      } catch (err) {
        console.error("Failed to load certificates:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchCertificates();
    return () => { cancelled = true; };
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
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Certificate link copied to clipboard!");
    }
  };

  if (selectedCert) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 relative certificate-page">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #certificate-document,
            #certificate-document * {
              visibility: visible;
            }
            #certificate-document {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {toastMessage && (
          <div className="no-print fixed top-4 left-1/2 z-50 -translate-x-1/2 bg-[#196A54] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xl">
            {toastMessage}
          </div>
        )}

        <button
          type="button"
          onClick={() => setSelectedCert(null)}
          className="no-print inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </button>

        <div
          id="certificate-document"
          className="bg-white border-2 border-slate-800 rounded-3xl p-10 shadow-xl relative overflow-hidden text-center space-y-6"
        >
          {/* Geometric background patterns with brand colors */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(#0A4A3A_2px,transparent_2px)] [background-size:24px_24px]" />
            <div className="absolute inset-0 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:32px_32px]" />
          </div>

          {/* Top left geometric design */}
          <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
            <div className="absolute top-4 left-4 w-16 h-16 border-4 border-[#0A4A3A] rounded-full opacity-60" />
            <div className="absolute top-8 left-8 w-8 h-8 bg-[#84cc16] rounded-full opacity-40" />
            <div className="absolute top-0 left-20 w-0 h-0 border-l-[20px] border-l-transparent border-t-[30px] border-t-[#0A4A3A] opacity-50" />
            <div className="absolute top-12 left-0 w-0 h-0 border-r-[15px] border-r-transparent border-b-[25px] border-b-[#C2F25B] opacity-40" />
            <div className="absolute top-2 left-2 w-20 h-1 bg-[#84cc16] opacity-30 transform -rotate-45" />
            <div className="absolute top-6 left-6 w-16 h-1 bg-[#0A4A3A] opacity-30 transform -rotate-45" />
          </div>

          {/* Top right geometric design */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
            <div className="absolute top-4 right-4 w-16 h-16 border-4 border-[#0A4A3A] rounded-full opacity-60" />
            <div className="absolute top-8 right-8 w-8 h-8 bg-[#84cc16] rounded-full opacity-40" />
            <div className="absolute top-0 right-20 w-0 h-0 border-r-[20px] border-r-transparent border-t-[30px] border-t-[#0A4A3A] opacity-50" />
            <div className="absolute top-12 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-b-[25px] border-b-[#C2F25B] opacity-40" />
            <div className="absolute top-2 right-2 w-20 h-1 bg-[#84cc16] opacity-30 transform rotate-45" />
            <div className="absolute top-6 right-6 w-16 h-1 bg-[#0A4A3A] opacity-30 transform rotate-45" />
          </div>

          {/* Bottom left geometric design */}
          <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
            <div className="absolute bottom-4 left-4 w-16 h-16 border-4 border-[#0A4A3A] rounded-full opacity-60" />
            <div className="absolute bottom-8 left-8 w-8 h-8 bg-[#84cc16] rounded-full opacity-40" />
            <div className="absolute bottom-0 left-20 w-0 h-0 border-l-[20px] border-l-transparent border-b-[30px] border-b-[#0A4A3A] opacity-50" />
            <div className="absolute bottom-12 left-0 w-0 h-0 border-r-[15px] border-r-transparent border-t-[25px] border-t-[#C2F25B] opacity-40" />
            <div className="absolute bottom-2 left-2 w-20 h-1 bg-[#84cc16] opacity-30 transform rotate-45" />
            <div className="absolute bottom-6 left-6 w-16 h-1 bg-[#0A4A3A] opacity-30 transform rotate-45" />
          </div>

          {/* Bottom right geometric design */}
          <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
            <div className="absolute bottom-4 right-4 w-16 h-16 border-4 border-[#0A4A3A] rounded-full opacity-60" />
            <div className="absolute bottom-8 right-8 w-8 h-8 bg-[#84cc16] rounded-full opacity-40" />
            <div className="absolute bottom-0 right-20 w-0 h-0 border-r-[20px] border-r-transparent border-b-[30px] border-b-[#0A4A3A] opacity-50" />
            <div className="absolute bottom-12 right-0 w-0 h-0 border-l-[15px] border-l-transparent border-t-[25px] border-t-[#C2F25B] opacity-40" />
            <div className="absolute bottom-2 right-2 w-20 h-1 bg-[#84cc16] opacity-30 transform -rotate-45" />
            <div className="absolute bottom-6 right-6 w-16 h-1 bg-[#0A4A3A] opacity-30 transform -rotate-45" />
          </div>

          {/* Subtle gradient borders */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0A4A3A] to-transparent opacity-30" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#84cc16] to-transparent opacity-30" />

          <div className="flex justify-center items-center space-x-2 text-[#0A4A3A]">
            <Award className="w-10 h-10" />
            <span className="font-extrabold tracking-widest text-sm uppercase">Mech Spec Technologies LMS</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Certificate of Completion</p>
            <h2 className="text-3xl font-serif text-slate-900">This is to certify that</h2>
            <p className="text-2xl font-bold font-serif text-[#0A4A3A] underline decoration-slate-300 underline-offset-8">
              {user?.fullName || "Student"}
            </p>
            <p className="text-sm text-slate-500 pt-2">has successfully completed the course</p>
          </div>

          <div className="py-4 px-6 bg-slate-50 rounded-2xl border border-slate-200 inline-block mx-auto max-w-lg">
            <h3 className="text-xl font-bold text-slate-900">{selectedCert.courseTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">Instructed by {selectedCert.instructorName}</p>
          </div>

          <div className="flex justify-around items-center pt-6 border-t border-slate-100 text-xs text-slate-600">
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

        <div className="no-print flex justify-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button type="button" onClick={handleDownload} className="flex items-center gap-2 bg-[#196A54] hover:bg-[#12503F] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button type="button" onClick={handleShare} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Share2 className="w-4 h-4" />
            <span>Share Certificate</span>
          </button>
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Certificates</h1>
        <p className="text-sm text-slate-500 mt-1">{certificates.length} verified certificate{certificates.length !== 1 ? "s" : ""} earned</p>
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
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#196A54] flex items-center justify-center font-bold flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{cert.courseTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Instructor: {cert.instructorName} · Issued: {cert.completedAt}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-1">{cert.certificateId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="px-4 py-2 bg-[#196A54] hover:bg-[#12503F] text-white rounded-xl text-xs font-semibold transition-all"
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
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Complete your enrolled courses to unlock verified completion certificates.</p>
        </div>
      )}
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading certificates...</div>}>
      <CertificatesContent />
    </Suspense>
  );
}
