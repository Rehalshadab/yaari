"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message.replace("Firebase: ", "").split(".")[0]);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />

      <div className="glass rounded-3xl p-8 w-full max-w-md relative z-10">
        <h1 className="text-3xl font-bold text-center mb-1">
          <span className="gradient-text">Welcome Back</span>
        </h1>
        <p className="text-center text-purple-300/60 mb-8">
          Sign in to your Yaari account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/30 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-purple-300/60 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-pink-400 hover:text-pink-300 transition">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
