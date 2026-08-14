"use client";

import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import api from "@/lib/api";
import { uploadAvatar } from "@/lib/upload.api";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import type { InstructorProfile } from "@/types/instructor";

export default function InstructorSettingsPage() {
  const authStore = useAuthStore() as { user?: { fullName?: string }; setUser?: (u: unknown) => void };
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [expertiseInput, setExpertiseInput] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/instructor/profile");
        if (!cancelled) setProfile(res.data.profile);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSuccess(null);
    try {
      const res = await api.patch("/instructor/profile", {
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl ?? "",
        specialization: profile.specialization ?? "",
        credentials: profile.credentials ?? "",
        shortBio: profile.shortBio ?? "",
        bio: profile.bio ?? "",
        expertise: profile.expertise,
        experienceYears: profile.experienceYears ?? undefined,
        instructorCategory: profile.instructorCategory ?? "",
        region: profile.region ?? undefined,
      });
      setProfile(res.data.profile);
      if (authStore.setUser) authStore.setUser(res.data.profile);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(null), 4000);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const url = await uploadAvatar(file);
      setProfile({ ...profile, avatarUrl: url });
    } catch {
      setSuccess(null);
      // Brief inline feedback — settings page has no dedicated error banner
      alert("Failed to upload photo. Please try again.");
    }
  }

  function addExpertise() {
    if (!profile || !expertiseInput.trim()) return;
    if (profile.expertise.includes(expertiseInput.trim())) return;
    setProfile({ ...profile, expertise: [...profile.expertise, expertiseInput.trim()] });
    setExpertiseInput("");
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <LoadingSkeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return <div className="p-6 md:p-8"><p className="text-sm text-slate-500">Could not load profile.</p></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and public instructor profile.</p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{success}</div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Account</h2>
          <div className="flex items-center gap-4">
            <Avatar name={profile.fullName} imageUrl={profile.avatarUrl ?? undefined} size="lg" />
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#196A54]">
              <Upload className="w-4 h-4" /> Upload photo
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input value={profile.email} disabled className="w-full rounded-lg border px-4 py-2.5 text-sm bg-slate-50 text-slate-500" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-900">Public Instructor Profile</h2>
          <p className="text-xs text-slate-500">Shown on your public instructor page at /instructors/[id]</p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Specialization</label>
            <input
              value={profile.specialization ?? ""}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Credentials</label>
            <input
              value={profile.credentials ?? ""}
              onChange={(e) => setProfile({ ...profile, credentials: e.target.value })}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Short Bio</label>
            <input
              value={profile.shortBio ?? ""}
              onChange={(e) => setProfile({ ...profile, shortBio: e.target.value })}
              className="w-full rounded-lg border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Bio</label>
            <textarea
              rows={4}
              value={profile.bio ?? ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full rounded-lg border px-4 py-2.5 text-sm resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Experience (years)</label>
              <input
                type="number"
                min={0}
                value={profile.experienceYears ?? ""}
                onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value || null })}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <input
                value={profile.instructorCategory ?? ""}
                onChange={(e) => setProfile({ ...profile, instructorCategory: e.target.value })}
                className="w-full rounded-lg border px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Expertise</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.expertise.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, expertise: profile.expertise.filter((t) => t !== tag) })}
                    className="text-emerald-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                placeholder="Add expertise tag"
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addExpertise(); } }}
              />
              <button type="button" onClick={addExpertise} className="px-4 py-2 rounded-lg border text-sm font-semibold">
                Add
              </button>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#196A54] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
