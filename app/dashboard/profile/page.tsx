"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { FiPhone, FiMail, FiCreditCard } from "react-icons/fi";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const [upiId, setUpiId] = useState(userData?.upiId || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const updates: any = { bio };
      if (userData?.gender === "female") updates.upiId = upiId;
      await updateDoc(doc(db, "users", user.uid), updates);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update"); }
    setSaving(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
        <div className="glass rounded-2xl p-8 text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {userData?.displayName?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="text-xl font-bold text-white">{userData?.displayName}</h2>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-purple-300">
            {userData?.gender === "male" ? "👨 Male" : "👩 Female"}
          </span>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm text-purple-300/60">
              <FiMail className="shrink-0" /> <span>{userData?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-purple-300/60">
              <FiPhone className="shrink-0" /> <span>{userData?.phone}</span>
            </div>
            {userData?.gender === "male" && (
              <div className="flex items-center gap-3 text-sm text-purple-300/60">
                <FiCreditCard className="shrink-0" /> <span>{userData?.coins || 0} coins</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-purple-300/60 mb-1 block">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="Tell something about yourself..." rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none" />
            </div>
            {userData?.gender === "female" && (
              <div>
                <label className="text-sm text-purple-300/60 mb-1 block">UPI ID (for withdrawals)</label>
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)}
                  placeholder="example@upi"
                  className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
              </div>
            )}
            <button type="submit" disabled={saving}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30 disabled:opacity-50">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
