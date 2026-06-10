"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FiSmartphone, FiUsers, FiDollarSign, FiShield } from "react-icons/fi";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-xs text-purple-300/70 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live & Open for Everyone
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            <span className="gradient-text">Yaari</span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-200/80 mb-3 font-medium">Connect. Chat. Earn.</p>
          <p className="text-sm md:text-base text-purple-300/60 mb-10 max-w-lg mx-auto">
            Meet new people through live audio & video calls.{" "}
            <span className="text-yellow-400/80 font-semibold">Earn real money</span> while you chat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 glass text-white rounded-full font-semibold text-lg hover:bg-white/15 transition"
            >
              Sign In
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="glass rounded-2xl p-4">
              <FiSmartphone size={24} className="mx-auto text-purple-400 mb-2" />
              <p className="text-sm font-medium text-white">Audio Calls</p>
              <p className="text-xs text-purple-300/50 mt-1">Live talk</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <FiUsers size={24} className="mx-auto text-pink-400 mb-2" />
              <p className="text-sm font-medium text-white">Video Calls</p>
              <p className="text-xs text-purple-300/50 mt-1">Face to face</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <FiDollarSign size={24} className="mx-auto text-yellow-400 mb-2" />
              <p className="text-sm font-medium text-white">Earn Money</p>
              <p className="text-xs text-purple-300/50 mt-1">Real payouts</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <FiShield size={24} className="mx-auto text-green-400 mb-2" />
              <p className="text-sm font-medium text-white">Safe & Secure</p>
              <p className="text-xs text-purple-300/50 mt-1">Private calls</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center max-w-lg">
          <p className="text-xs text-purple-300/30">
            By joining, you agree to our Terms of Service. 18+ only.
          </p>
        </div>
      </main>
    </div>
  );
}
