"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllUsers, getAllCalls, getAllWithdrawals, getAllTransactions, approveWithdrawal, approveTransaction } from "@/lib/firestore";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [tab, setTab] = useState<"users" | "calls" | "withdrawals" | "transactions">("users");

  useEffect(() => {
    if (!loading && (!user || user?.email?.toLowerCase() !== "rehalon786@gmail.com")) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    getAllUsers().then(setUsers);
    getAllCalls().then(setCalls);
    getAllWithdrawals().then(setWithdrawals);
    getAllTransactions().then(setTransactions);
  }, []);

  const handleApproveWithdrawal = async (id: string) => {
    await approveWithdrawal(id);
    setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: "completed" } : w));
    toast.success("Withdrawal approved");
  };

  const handleApproveTransaction = async (tx: any) => {
    await approveTransaction(tx.id, tx.userId, tx.coins);
    setTransactions((prev) => prev.map((t) => t.id === tx.id ? { ...t, status: "completed" } : t));
    toast.success(`${tx.coins} coins added to ${getUserName(tx.userId)}`);
  };

  if (loading || !user) return null;

  const getUserName = (uid: string) => users.find((u) => u.id === uid)?.displayName || uid.slice(0, 8) + "...";
  const getUserUpi = (uid: string) => users.find((u) => u.id === uid)?.upiId || "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          <Link href="/dashboard" className="text-sm text-purple-300/60 hover:text-white transition">Back to Dashboard</Link>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <button onClick={() => setTab("users")} className={`px-6 py-2 rounded-xl font-medium transition ${tab === "users" ? "bg-purple-500 text-white" : "bg-white/10 text-purple-300/60 hover:text-white"}`}>Users ({users.length})</button>
          <button onClick={() => setTab("calls")} className={`px-6 py-2 rounded-xl font-medium transition ${tab === "calls" ? "bg-purple-500 text-white" : "bg-white/10 text-purple-300/60 hover:text-white"}`}>Calls ({calls.length})</button>
          <button onClick={() => setTab("transactions")} className={`px-6 py-2 rounded-xl font-medium transition ${tab === "transactions" ? "bg-purple-500 text-white" : "bg-white/10 text-purple-300/60 hover:text-white"}`}>Deposits ({transactions.length})</button>
          <button onClick={() => setTab("withdrawals")} className={`px-6 py-2 rounded-xl font-medium transition ${tab === "withdrawals" ? "bg-purple-500 text-white" : "bg-white/10 text-purple-300/60 hover:text-white"}`}>Withdrawals ({withdrawals.length})</button>
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
                    <th className="p-4">UPI</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Coins</th>
                    <th className="p-4">Earnings</th>
                    <th className="p-4">Calls</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 text-white hover:bg-white/5 transition">
                      <td className="p-4 font-medium">{u.displayName || "—"}</td>
                      <td className="p-4 text-purple-300/70">{u.email || "—"}</td>
                      <td className="p-4">{u.phone || "—"}</td>
                      <td className="p-4 text-xs text-purple-300/70">{u.upiId || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${u.gender === "female" ? "bg-pink-500/20 text-pink-300" : "bg-blue-500/20 text-blue-300"}`}>{u.gender}</span>
                      </td>
                      <td className="p-4">{u.coins ?? 0}</td>
                      <td className="p-4">₹{u.earnings ?? 0}</td>
                      <td className="p-4">{u.callCount ?? 0}</td>
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
                      <td className="p-4 font-medium">{getUserName(c.callerId)}</td>
                      <td className="p-4">{getUserName(c.receiverId)}</td>
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

        {tab === "transactions" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-purple-300/60 text-left">
                    <th className="p-4">User</th>
                    <th className="p-4">Coins</th>
                    <th className="p-4">UTR / Ref ID</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 text-white hover:bg-white/5 transition">
                      <td className="p-4 font-medium">{getUserName(tx.userId)}</td>
                      <td className="p-4 text-yellow-400 font-semibold">{tx.coins}</td>
                      <td className="p-4 text-xs text-purple-300/70 font-mono">{tx.upiTxnId || "—"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${tx.status === "completed" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>{tx.status}</span>
                      </td>
                      <td className="p-4 text-xs text-purple-300/60">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        {tx.status !== "completed" ? (
                          <button onClick={() => handleApproveTransaction(tx)}
                            className="px-4 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-xs font-medium hover:bg-green-500/30 transition">
                            Verify & Add Coins
                          </button>
                        ) : (
                          <span className="text-xs text-purple-300/40">✓ Added</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-purple-300/40">No deposit requests</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "withdrawals" && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-purple-300/60 text-left">
                    <th className="p-4">User</th>
                    <th className="p-4">UPI ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-white/5 text-white hover:bg-white/5 transition">
                      <td className="p-4 font-medium">{getUserName(w.userId)}</td>
                      <td className="p-4 text-xs text-purple-300/70">{w.upiId || getUserUpi(w.userId)}</td>
                      <td className="p-4 text-green-400 font-semibold">₹{w.amount}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${w.status === "completed" ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>{w.status}</span>
                      </td>
                      <td className="p-4 text-xs text-purple-300/60">{new Date(w.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        {w.status !== "completed" ? (
                          <button onClick={() => handleApproveWithdrawal(w.id)}
                            className="px-4 py-1.5 bg-green-500/20 text-green-300 rounded-lg text-xs font-medium hover:bg-green-500/30 transition">
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-xs text-purple-300/40">✓ Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-purple-300/40">No withdrawal requests</td></tr>
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
