"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateUserStatus } from "@/lib/firestore";
import { FiPhone, FiVideo } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ActiveButton() {
  const { user, userData } = useAuth();
  const [active, setActive] = useState(userData?.isActive || false);
  const [audioOn, setAudioOn] = useState(userData?.activeModes?.audio || false);
  const [videoOn, setVideoOn] = useState(userData?.activeModes?.video || false);
  const [showModes, setShowModes] = useState(false);

  const toggleActive = async () => {
    if (!user) return;
    const newActive = !active;
    setActive(newActive);
    setShowModes(newActive);
    if (!newActive) {
      setAudioOn(false);
      setVideoOn(false);
    }
    await updateUserStatus(user.uid, {
      isActive: newActive,
      activeModes: newActive ? { audio: audioOn, video: videoOn } : { audio: false, video: false },
    });
    if (newActive) toast.success("You're now active!");
    else toast("You're offline");
  };

  const toggleMode = async (mode: "audio" | "video") => {
    if (!user) return;
    if (!active) return;
    if (mode === "audio") {
      const newAudio = !audioOn;
      setAudioOn(newAudio);
      await updateUserStatus(user.uid, {
        activeModes: { audio: newAudio, video: videoOn },
      });
    } else {
      const newVideo = !videoOn;
      setVideoOn(newVideo);
      await updateUserStatus(user.uid, {
        activeModes: { audio: audioOn, video: newVideo },
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 relative z-10">
      <button
        onClick={toggleActive}
        className={`relative w-24 h-24 rounded-full transition-all duration-500 shadow-xl ${
          active
            ? "bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse-glow"
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        }`}
      >
        <div className="absolute inset-0 rounded-full flex items-center justify-center">
          <span className="text-white text-lg font-bold">
            {active ? "ON" : "OFF"}
          </span>
        </div>
      </button>
      <p className="text-sm text-purple-300/60">
        {active ? "You're active and visible" : "Tap to go active"}
      </p>

      {showModes && active && (
        <div className="flex gap-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            onClick={() => toggleMode("audio")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${
              audioOn
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/5 text-purple-300/50 border border-white/10 hover:bg-white/10"
            }`}
          >
            <FiPhone size={18} />
            <span className="text-sm font-medium">Audio</span>
          </button>
          <button
            onClick={() => toggleMode("video")}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition ${
              videoOn
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-white/5 text-purple-300/50 border border-white/10 hover:bg-white/10"
            }`}
          >
            <FiVideo size={18} />
            <span className="text-sm font-medium">Video</span>
          </button>
        </div>
      )}

      {active && (
        <p className="text-xs text-purple-300/30 mt-2">
          {audioOn && videoOn
            ? "Available for audio & video calls"
            : audioOn
            ? "Available for audio calls only"
            : videoOn
            ? "Available for video calls only"
            : "Select a mode to receive calls"}
        </p>
      )}
    </div>
  );
}
