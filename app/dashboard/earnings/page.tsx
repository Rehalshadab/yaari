"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { requestWithdrawal } from "@/lib/firestore";
import { FiDollarSign, FiArrowUpRight } from "react-icons/fi";
import toast from "react-hot-toast";

export default function EarningsPage() {
  const { userData } = useAuth();
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !withdrawAmt) return;
    const amount = parseInt(withdrawAmt);
    if (amount < 50) { toast.error("Minimum withdrawal is ₹50"); return; }
    if (amount > (userData.earnings || 0)) { toast.error("Insufficient earnings"); return; }
    if (!userData.upiId) { toast.error("Add a UPI ID in your profile first"); return; }
    setLoading(true);
    try {
      await requestWithdrawal(userData.uid, amount, userData.upiId);
      toast.success("Withdrawal request submitted! Admin will process it.");
      setWithdrawAmt("");
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  if (userData?.gender !== "female") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <FiDollarSign className="text-4xl text-purple-400 mx-auto mb-3" />
          <p className="text-white font-semibold">Earnings</p>
          <p className="text-purple-300/50 text-sm mt-1">This section is for female users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Your Earnings</h1>
        <p className="text-purple-300/60 mb-6">Withdraw your earnings to UPI</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold gradient-text">₹{userData?.earnings || 0}</p>
            <p className="text-xs text-purple-300/50 mt-1">Available Balance</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-white">₹{userData?.totalEarned || 0}</p>
            <p className="text-xs text-purple-300/50 mt-1">Total Earned</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Withdraw to UPI</h2>
          <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-purple-300/60 mb-1 block">UPI ID</label>
              <input type="text" value={userData?.upiId || "Not set"} readOnly
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-purple-300/60 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-sm text-purple-300/60 mb-1 block">Amount (₹)</label>
              <input type="number" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)}
                placeholder="Min ₹50" min="50"
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <button type="submit" disabled={loading || !withdrawAmt}
              className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiArrowUpRight /> Withdraw</>}
            </button>
          </form>
          <p className="text-xs text-purple-300/30 text-center mt-3">
            Withdrawals are processed manually by admin within 24-48 hours
          </p>
        </div>
      </div>
    </div>
  );
}
