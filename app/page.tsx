"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="text-center max-w-md relative z-10">
        <h1 className="text-7xl font-bold mb-4">
          <span className="gradient-text">Yaari</span>
        </h1>
        <p className="text-lg text-purple-200/80 mb-3">Connect. Chat. Earn.</p>
        <p className="text-sm text-purple-300/60 mb-10 max-w-xs mx-auto">
          Where conversations turn into opportunities
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/login"
            className="w-full px-8 py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="w-full px-8 py-3.5 glass text-white rounded-full font-semibold text-lg hover:bg-white/15 transition"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="glass rounded-xl p-3">
            <p className="text-2xl font-bold gradient-text">🎧</p>
            <p className="text-xs text-purple-300/70 mt-1">Audio Calls</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-2xl font-bold gradient-text">📹</p>
            <p className="text-xs text-purple-300/70 mt-1">Video Calls</p>
          </div>
          <div className="glass rounded-xl p-3">
            <p className="text-2xl font-bold gradient-text">💰</p>
            <p className="text-xs text-purple-300/70 mt-1">Earn Money</p>
          </div>
        </div>
      </div>
    </div>
  );
}
