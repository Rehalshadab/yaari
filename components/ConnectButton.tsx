"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { findRandomFemale, createCall } from "@/lib/firestore";
import { FiPhone, FiVideo } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ConnectButton() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [connecting, setConnecting] = useState<"audio" | "video" | null>(null);

  const handleConnect = async (mode: "audio" | "video") => {
    if (!user || !userData) return;
    const cost = mode === "audio" ? 10 : 15;
    if ((userData.coins || 0) < cost) {
      toast.error(`Need ${cost} coins for ${mode} call. Buy coins first!`);
      router.push("/dashboard/coins");
      return;
    }
    setConnecting(mode);
    try {
      const result: any = await findRandomFemale(mode);
      if (!result) {
        toast.error("No active users available. Try again!");
        setConnecting(null);
        return;
      }
      const callId = await createCall(user.uid, result.uid || result.id, mode);
      router.push(`/callui/${callId}`);
    } catch {
      toast.error("Failed to connect");
      setConnecting(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="flex gap-4">
        <button onClick={() => handleConnect("audio")} disabled={connecting !== null}
          className="flex flex-col items-center gap-3 px-10 py-6 glass rounded-2xl hover:bg-white/10 transition disabled:opacity-50 min-w-[140px]">
          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
            {connecting === "audio"
              ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FiPhone size={24} className="text-white" />}
          </div>
          <span className="text-white font-semibold">Audio</span>
          <span className="text-xs text-purple-300/50">10 coins/min</span>
        </button>
        <button onClick={() => handleConnect("video")} disabled={connecting !== null}
          className="flex flex-col items-center gap-3 px-10 py-6 glass rounded-2xl hover:bg-white/10 transition disabled:opacity-50 min-w-[140px]">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
            {connecting === "video"
              ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <FiVideo size={24} className="text-white" />}
          </div>
          <span className="text-white font-semibold">Video</span>
          <span className="text-xs text-purple-300/50">15 coins/min</span>
        </button>
      </div>
      <p className="text-xs text-purple-300/40 mt-2">Connected to a random active person</p>
    </div>
  );
}
