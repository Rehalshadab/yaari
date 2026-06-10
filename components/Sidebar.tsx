"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiHome, FiDollarSign, FiClock, FiUser, FiLogOut, FiShield, FiGift } from "react-icons/fi";
import { BiCoin } from "react-icons/bi";

export default function Sidebar() {
  const { userData, signOut } = useAuth();
  const pathname = usePathname();

  if (!userData) return null;

  const isFemale = userData.gender === "female";

  const links = [
    { href: "/dashboard", label: "Home", icon: FiHome },
    ...(isFemale
      ? [{ href: "/dashboard/earnings", label: "Earnings", icon: FiDollarSign }]
      : [{ href: "/dashboard/coins", label: "Buy Coins", icon: BiCoin }]),
    { href: "/dashboard/history", label: "History", icon: FiClock },
    { href: "/dashboard/referral", label: "Refer & Earn", icon: FiGift },
    { href: "/dashboard/profile", label: "Profile", icon: FiUser },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col h-full shrink-0">
      <div className="p-4 lg:p-6 border-b border-white/5">
        <Link href="/dashboard"><h1 className="text-2xl font-bold gradient-text text-center lg:text-left">Y</h1></Link>
      </div>
      <nav className="flex-1 py-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}
              className={`flex items-center justify-center lg:justify-start gap-3 px-4 lg:px-6 py-3.5 transition ${
                isActive ? "bg-purple-500/20 border-r-2 border-purple-400 text-white" : "text-purple-300/50 hover:text-white hover:bg-white/5"
              }`}>
              <link.icon size={20} />
              <span className="hidden lg:block text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      {userData?.email?.toLowerCase() === "rehalon786@gmail.com" && (
        <Link href="/admin"
          className={`flex items-center justify-center lg:justify-start gap-3 px-4 lg:px-6 py-3.5 transition text-purple-300/50 hover:text-white hover:bg-white/5 ${
            pathname === "/admin" ? "bg-purple-500/20 border-r-2 border-purple-400 text-white" : ""
          }`}>
          <FiShield size={20} />
          <span className="hidden lg:block text-sm font-medium">Admin</span>
        </Link>
      )}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userData.displayName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-medium text-white truncate">{userData.displayName}</p>
            <p className="text-xs text-purple-300/50">
              {isFemale ? `₹${userData.earnings}` : `${userData.coins} coins`}
            </p>
          </div>
        </div>
        <button onClick={signOut}
          className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2 text-sm text-purple-300/40 hover:text-red-400 transition">
          <FiLogOut size={16} />
          <span className="hidden lg:block">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
