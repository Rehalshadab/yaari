"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCallHistory, getUserProfile } from "@/lib/firestore";
import { FiPhone, FiVideo, FiClock, FiDownload } from "react-icons/fi";

export default function HistoryPage() {
  const { user, userData } = useAuth();
  const [calls, setCalls] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data: any[] = await getCallHistory(user.uid);
      setCalls(data);
      for (const call of data) {
        const otherId = call.callerId === user.uid ? call.receiverId : call.callerId;
        if (!profiles[otherId]) {
          const p = await getUserProfile(otherId);
          if (p) setProfiles((prev) => ({ ...prev, [otherId]: p }));
        }
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Call History</h1>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : calls.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <FiPhone className="text-3xl text-purple-400 mx-auto mb-3" />
            <p className="text-white font-semibold">No calls yet</p>
            <p className="text-purple-300/50 text-sm mt-1">Your call history will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {calls.map((call) => {
              const otherId = call.callerId === user?.uid ? call.receiverId : call.callerId;
              const other = profiles[otherId];
              const isCaller = call.callerId === user?.uid;
              const isFemale = userData?.gender === "female";

              return (
                <div key={call.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        call.type === "video" ? "bg-gradient-to-br from-blue-400 to-purple-500" : "bg-gradient-to-br from-green-400 to-teal-500"
                      }`}>
                        {call.type === "video" ? <FiVideo /> : <FiPhone />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{other?.displayName || "Unknown"}</p>
                        <div className="flex items-center gap-2 text-xs text-purple-300/50">
                          <span className={call.status === "ended" ? "text-green-400" : call.status === "rejected" ? "text-red-400" : "text-yellow-400"}>
                            {call.status === "ended" ? "Completed" : call.status === "rejected" ? "Missed" : call.status}
                          </span>
                          {call.duration > 0 && <><span>•</span><span>{Math.floor(call.duration / 60)}m {call.duration % 60}s</span></>}
                          {call.totalCost > 0 && !isFemale && <><span>•</span><span>-{call.totalCost} coins</span></>}
                          {call.femaleEarnings > 0 && isFemale && <><span>•</span><span className="text-green-400">+₹{call.femaleEarnings}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {call.recordingUrl && (
                        <a href={call.recordingUrl} target="_blank" rel="noopener noreferrer"
                          className="p-2 text-purple-400 hover:text-purple-300 transition" title="Download recording">
                          <FiDownload size={16} />
                        </a>
                      )}
                      <FiClock className="text-purple-300/30" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
