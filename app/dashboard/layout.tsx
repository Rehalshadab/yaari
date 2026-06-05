"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCall } from "@/context/CallContext";
import Sidebar from "@/components/Sidebar";
import IncomingCallModal from "@/components/IncomingCallModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { incomingCall } = useCall();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen relative">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-purple-950 via-purple-900 to-pink-900">
        {children}
      </main>
      {incomingCall && <IncomingCallModal />}
    </div>
  );
}
