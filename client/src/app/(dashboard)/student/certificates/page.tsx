"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch aligned with backend certificate contract / enrollments with 100% progress
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        // In production, replace with your actual backend endpoint: api.get("/certificates")
        setTimeout(() => {
          setCertificates([
            {
              id: "cert-1",
              courseTitle: "Mechanical Design Basics",
              instructorName: "Dr. James Walker",
              completedAt: "May 30, 2025",
              certificateId: "MST-LMS-2025-0042",
              hours: 42,
              distinction: "Distinction",
            },
            {
              id: "cert-2",
              courseTitle: "Thermodynamics & Heat Transfer",
              instructorName: "Prof. Sarah Chen",
              completedAt: "Mar 1, 2025",
              certificateId: "MST-LMS-2025-0018",
              hours: 38,
              distinction: "Merit",
            },
          ]);
          setIsLoading(false);
        }, 300);
      } catch (err) {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (selectedCert) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* Navigation back to list */}
        <button
          onClick={() => setSelectedCert(null)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </button>

        {/* Certificate Printable Render Container */}
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
              Daniel Johnson
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

        {/* Action Toolbar */}
        <div className="flex justify-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button className="flex items-center gap-2 bg-[#0a3832] hover:bg-[#0f4a42] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
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
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all">
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

