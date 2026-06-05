"use client";

import { useState, useEffect } from "react";
import { useCall } from "@/context/CallContext";
import { getUserProfile } from "@/lib/firestore";
import { FiPhone, FiVideo, FiPhoneOff } from "react-icons/fi";

export default function IncomingCallModal() {
  const { incomingCall, handleAccept, handleReject } = useCall();
  const [caller, setCaller] = useState<any>(null);

  useEffect(() => {
    if (!incomingCall) return;
    getUserProfile(incomingCall.callerId).then((p) => setCaller(p));
  }, [incomingCall]);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-dark rounded-3xl p-8 text-center max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 animate-ring-pulse shadow-lg shadow-purple-500/30">
          {caller?.displayName?.charAt(0).toUpperCase() || "?"}
        </div>

        <p className="text-white text-xl font-semibold">
          {caller?.displayName || "Connecting..."}
        </p>
        <p className="text-purple-300/60 mb-6 flex items-center justify-center gap-2">
          {incomingCall.type === "video" ? (
            <>
              <FiVideo /> Video Call
            </>
          ) : (
            <>
              <FiPhone /> Audio Call
            </>
          )}
        </p>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleReject}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg shadow-red-500/20 animate-ring-pulse"
          >
            <FiPhoneOff size={24} className="text-white" />
          </button>
          <button
            onClick={handleAccept}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition shadow-lg shadow-green-500/20 animate-ring-pulse"
          >
            <FiPhone size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
