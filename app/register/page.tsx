"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) setReferralCode(ref);
  }, []);

  const handleGenderSelect = (g: "male" | "female") => {
    setGender(g);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      await createUserProfile(cred.user.uid, {
        displayName,
        email,
        phone,
        gender,
      }, referralCode.trim() || undefined);
      toast.success("Account created! Welcome to Yaari.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message.replace("Firebase: ", "").split(".")[0]);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="glass rounded-3xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-3xl font-bold text-center mb-1">
          <span className="gradient-text">Join Yaari</span>
        </h1>
        <p className="text-center text-purple-300/60 mb-8">
          {step === 1 ? "Tell us about yourself" : "Create your account"}
        </p>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleGenderSelect("male")}
              className={`w-full p-5 rounded-2xl border-2 transition text-left ${
                gender === "male"
                  ? "border-purple-500 bg-purple-500/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="text-3xl">👨</span>
              <p className="text-white font-semibold mt-2">Male</p>
              <p className="text-purple-300/50 text-sm">Connect & chat</p>
            </button>
            <button
              onClick={() => handleGenderSelect("female")}
              className={`w-full p-5 rounded-2xl border-2 transition text-left ${
                gender === "female"
                  ? "border-pink-500 bg-pink-500/20"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className="text-3xl">👩</span>
              <p className="text-white font-semibold mt-2">Female</p>
              <p className="text-purple-300/50 text-sm">Connect & earn</p>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <input
              type="text"
              placeholder="Referral code (optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-purple-300/60 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-400 hover:text-pink-300 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
