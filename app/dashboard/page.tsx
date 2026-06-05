"use client";

import { useAuth } from "@/context/AuthContext";
import ActiveButton from "@/components/ActiveButton";
import ConnectButton from "@/components/ConnectButton";
import { FiDollarSign, FiClock, FiTrendingUp, FiPhone } from "react-icons/fi";

export default function DashboardPage() {
  const { userData } = useAuth();
  if (!userData) return null;

  if (userData.gender === "female") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="text-center mb-8 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-pink-500/30">
            {userData.displayName?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Hey, {userData.displayName}!</h1>
          <p className="text-purple-300/60">Tap active to start earning</p>
        </div>
        <div className="flex gap-6 mb-8 relative z-10">
          <div className="glass rounded-2xl p-4 text-center min-w-[120px]">
            <FiDollarSign className="text-pink-400 text-xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">₹{userData.earnings || 0}</p>
            <p className="text-xs text-purple-300/50">Earnings</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center min-w-[120px]">
            <FiClock className="text-purple-400 text-xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{Math.floor(userData.totalMinutes || 0)}</p>
            <p className="text-xs text-purple-300/50">Minutes</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center min-w-[120px]">
            <FiPhone className="text-green-400 text-xl mx-auto mb-1" />
            <p className="text-2xl font-bold text-white">{userData.callCount || 0}</p>
            <p className="text-xs text-purple-300/50">Calls</p>
          </div>
        </div>
        <ActiveButton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="text-center mb-8 relative z-10">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/30">
          {userData.displayName?.charAt(0).toUpperCase() || "U"}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Hey, {userData.displayName}!</h1>
        <p className="text-purple-300/60">
          You have <span className="text-yellow-400 font-bold">{userData.coins || 0}</span> coins
        </p>
      </div>
      <div className="glass rounded-2xl p-4 text-center min-w-[140px] mb-8 relative z-10">
        <FiTrendingUp className="text-yellow-400 text-xl mx-auto mb-1" />
        <p className="text-2xl font-bold text-white">{userData.coins || 0}</p>
        <p className="text-xs text-purple-300/50">Available Coins</p>
      </div>
      <ConnectButton />
    </div>
  );
}
