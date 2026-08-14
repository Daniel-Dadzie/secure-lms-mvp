"use client";

import { useState } from "react";
import { User, Mail, Shield, CheckCircle2, Save, Lock, Upload, FileText } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "@/components/ui/Avatar";
import api from "@/lib/api";
import { uploadAvatar } from "@/lib/upload.api";

export default function StudentProfilePage() {
  const authStore = useAuthStore() as any;
  const user = authStore?.user;
  const setUser = authStore?.setUser;

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Update Profile Details Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const response = await api.patch("/users/profile", { fullName, avatarUrl, bio });
      
      // Update global store if method is available
      if (setUser && response.data?.user) {
        setUser(response.data.user);
      }

      setSuccessMessage("Profile details and bio updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload Handler (Instantly syncs with TopBar via Auth Store)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);
    try {
      const uploadedUrl = await uploadAvatar(file);
      setAvatarUrl(uploadedUrl);

      // Save to user profile on the backend
      const updateRes = await api.patch("/users/profile", { fullName, avatarUrl: uploadedUrl, bio });
      
      // Instantly update the global auth store so the TopBar reflects it immediately
      const updatedUserData = updateRes.data?.user || { ...user, avatarUrl: uploadedUrl };
      if (setUser) {
        setUser(updatedUserData);
      } else {
        window.location.reload(); // Fallback reload if store setter is absent
      }

      setSuccessMessage("Profile photo updated successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Failed to upload image", err);
      setUploadError("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.post("/users/change-password", { currentPassword, newPassword });
      setPasswordMessage({ text: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({
        text: err?.response?.data?.message || "Failed to update password. Check your current password.",
        type: "error",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Student Profile & Security</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information, bio, profile photo, and password security.</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm">
          <span>{uploadError}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: AVATAR, UPLOAD & STATUS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="relative inline-block mx-auto">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-emerald-50 shadow-sm" />
              ) : (
                <Avatar name={fullName || "Student"} size="lg" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">{fullName || "Student User"}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{email}</p>
            </div>
            
            {/* Photo Upload Trigger */}
            <div>
              <label className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingImage ? "Uploading..." : "Change Photo"}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Shield className="w-3.5 h-3.5" /> Student Account
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFILE & SECURITY FORMS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Personal Information & Bio Form */}
          <form onSubmit={handleUpdateProfile} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#196A54]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Bio / About You</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share a brief introduction, your engineering discipline, or learning goals..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#196A54] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#196A54] hover:bg-[#12503F] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">Security & Password</h3>
            
            {passwordMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${passwordMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#196A54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#196A54]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#196A54]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-70"
              >
                <Lock className="w-4 h-4" />
                <span>{isUpdatingPassword ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}