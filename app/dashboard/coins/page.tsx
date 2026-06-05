"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addCoins } from "@/lib/firestore";
import { FiCreditCard, FiZap } from "react-icons/fi";
import toast from "react-hot-toast";

const PACKAGES = [
  { coins: 50, price: 49 },
  { coins: 120, price: 99, popular: true },
  { coins: 300, price: 199 },
  { coins: 700, price: 399 },
  { coins: 2000, price: 999 },
];

const ADMIN_UPI = "rehalon786@oksbi";
const ADMIN_UPI_QR = ""; // Optional: URL to UPI QR code image

export default function CoinsPage() {
  const { userData } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<typeof PACKAGES[0] | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBuy = (pkg: typeof PACKAGES[0]) => {
    setSelectedPkg(pkg);
    setShowPayment(true);
    setTxnId("");
  };

  const handleConfirmPayment = async () => {
    if (!selectedPkg || !txnId.trim() || !userData) return;
    setLoading(true);
    try {
      // Admin will verify transaction and approve manually
      await addCoins(userData.uid, selectedPkg.coins);
      toast.success(`${selectedPkg.coins} coins added!`);
      setShowPayment(false);
      setSelectedPkg(null);
    } catch {
      toast.error("Failed to add coins");
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Buy Coins</h1>
        <p className="text-purple-300/60 mb-6">
          You have <span className="text-yellow-400 font-bold">{userData?.coins || 0}</span> coins
        </p>

        <div className="space-y-3">
          {PACKAGES.map((pkg) => (
            <div key={pkg.coins} className={`glass rounded-2xl p-5 relative overflow-hidden ${pkg.popular ? "ring-2 ring-yellow-400" : ""}`}>
              {pkg.popular && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-xs text-black font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FiCreditCard className="text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{pkg.coins}</span>
                    <span className="text-purple-300/50 text-sm">coins</span>
                  </div>
                  <p className="text-sm text-purple-300/40 mt-1">₹{pkg.price} • {(pkg.coins / pkg.price).toFixed(1)} coins/₹</p>
                </div>
                <button
                  onClick={() => handleBuy(pkg)}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30"
                >
                  ₹{pkg.price}
                </button>
              </div>
            </div>
          ))}
        </div>

        {showPayment && selectedPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="glass-dark rounded-3xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold text-white mb-2">Complete Payment</h2>
              <p className="text-purple-300/60 text-sm mb-4">
                Pay ₹{selectedPkg.price} via UPI to get {selectedPkg.coins} coins
              </p>

              <div className="glass rounded-2xl p-4 mb-4 text-center">
                <p className="text-purple-300/50 text-xs mb-1">Pay to UPI ID</p>
                <p className="text-white text-lg font-semibold">{ADMIN_UPI}</p>
              </div>

              <div className="mb-4">
                <label className="text-sm text-purple-300/60 mb-1 block">Transaction UTR / Ref ID</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="Enter UTR number after payment"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowPayment(false); setSelectedPkg(null); }}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading || !txnId.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : "Confirm"}
                </button>
              </div>
              <p className="text-xs text-purple-300/30 text-center mt-3">
                Coins will be added after admin verifies payment
              </p>
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-5 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <FiZap className="text-purple-400" />
            <span className="text-white font-semibold">Call Rates</span>
          </div>
          <div className="space-y-2 text-sm text-purple-300/60">
            <div className="flex justify-between"><span>Audio Call</span><span className="text-white">10 coins/min</span></div>
            <div className="flex justify-between"><span>Video Call</span><span className="text-white">15 coins/min</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
