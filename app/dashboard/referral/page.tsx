"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FiCopy, FiShare2, FiUsers, FiGift } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ReferralPage() {
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!userData) return null;

  const shareLink = `https://yaari-six.vercel.app/register?ref=${userData.referralCode || ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join Yaari", text: `Join me on Yaari! Use my referral code: ${userData.referralCode}`, url: shareLink });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Refer & Earn</h1>
        <p className="text-purple-300/60 mb-6">
          Invite friends and earn <span className="text-yellow-400 font-bold">10 coins</span> for each signup
        </p>

        <div className="glass rounded-2xl p-6 mb-6 text-center">
          <p className="text-purple-300/50 text-xs mb-2">Your Referral Code</p>
          <p className="text-3xl font-bold gradient-text tracking-widest mb-4">{userData.referralCode || "—"}</p>
          <div className="flex gap-3">
            <button onClick={handleCopy}
              className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition flex items-center justify-center gap-2">
              <FiCopy size={16} /> {copied ? "Copied!" : "Copy Link"}
            </button>
            <button onClick={handleShare}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2">
              <FiShare2 size={16} /> Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-2xl p-5 text-center">
            <FiUsers size={24} className="mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{userData.referralCount || 0}</p>
            <p className="text-xs text-purple-300/50">Referrals</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <FiGift size={24} className="mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{userData.referralEarnings || 0}</p>
            <p className="text-xs text-purple-300/50">Coins Earned</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3">How it works</h2>
          <ol className="space-y-2 text-sm text-purple-300/70">
            <li>1. Share your referral link with friends</li>
            <li>2. They sign up using your code</li>
            <li>3. You get <span className="text-yellow-400">10 coins</span> instantly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
