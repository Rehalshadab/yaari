"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers, getAllCalls } from "@/lib/firestore";
import Link from "next/link";

export default function AdminPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [tab, setTab] = useState<"users" | "calls">("users");

  useEffect(() => {
    if (!loading && (!user || user?.email !== "admin@yaari.com")) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    getAllUsers().then(setUsers);
    getAllCalls().then(setCalls);
  }, []);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          <Link href="/dashboard" className="text-sm text-purple-300/60 hover:text-white transition">Back to Dashboard</Link>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab("users")} className={`px-6 py-2 rounded-xl font-medium transition ${tab === "users" ? "bg-purple-500 text-white" : "bg-white/10 text-purple-300/60 hover:text-white"}`}>Users ({users.length})</button>
          <button onClick={() => setTab("calls")} className={`px-6 py-2 rounded-xl font-medium transition ${tab === "calls" ? "bg-purple-500 text-white" : "bg-white/10 text-purple-300/60 hover:text-white"}`}>Calls ({calls.length})</button>
        </div>

        {tab === "users" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-purple-300/60 text-left">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Coins</th>
                    <th className="p-4">Earnings</th>
                    <th className="p-4">Calls</th>
                    <th className="p-4">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 text-white hover:bg-white/5 transition">
                      <td className="p-4 font-medium">{u.displayName || "—"}</td>
                      <td className="p-4 text-purple-300/70">{u.email || "—"}</td>
                      <td className="p-4">{u.phone || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${u.gender === "female" ? "bg-pink-500/20 text-pink-300" : "bg-blue-500/20 text-blue-300"}`}>{u.gender}</span>
                      </td>
                      <td className="p-4">{u.coins ?? 0}</td>
                      <td className="p-4">₹{u.earnings ?? 0}</td>
                      <td className="p-4">{u.callCount ?? 0}</td>
                      <td className="p-4">
                        <span className={`w-2 h-2 rounded-full inline-block ${u.isActive ? "bg-green-400" : "bg-gray-500"}`} />
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={8} className="p-8 text-center text-purple-300/40">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "calls" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-purple-300/60 text-left">
                    <th className="p-4">Caller</th>
                    <th className="p-4">Receiver</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Cost</th>
                    <th className="p-4">Recording</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((c) => (
                    <tr key={c.id} className="border-b border-white/5 text-white hover:bg-white/5 transition">
                      <td className="p-4 font-medium">{c.callerId?.slice(0, 8)}...</td>
                      <td className="p-4">{c.receiverId?.slice(0, 8)}...</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${c.type === "video" ? "bg-green-500/20 text-green-300" : "bg-purple-500/20 text-purple-300"}`}>{c.type}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "ended" ? "bg-gray-500/20 text-gray-300" : c.status === "ringing" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"}`}>{c.status}</span>
                      </td>
                      <td className="p-4">{c.duration ? `${Math.floor(c.duration / 60)}m ${c.duration % 60}s` : "—"}</td>
                      <td className="p-4">{c.totalCost ? `${c.totalCost} coins` : "—"}</td>
                      <td className="p-4">
                        {c.recordingUrl ? (
                          <a href={c.recordingUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline text-xs">Listen</a>
                        ) : (
                          <span className="text-purple-300/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {calls.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-purple-300/40">No calls found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 glass rounded-xl text-sm text-purple-300/50">
          <strong className="text-white">Note:</strong> Firebase Auth does not expose passwords (they are hashed server-side). Passwords cannot be retrieved from the system.
        </div>
      </div>
    </div>
  );
}
