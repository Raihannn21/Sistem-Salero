"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Package, 
  ShoppingCart, 
  LogOut,
  Menu as MenuIcon,
  X,
  BarChart3,
  History,
  Users
} from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["OWNER"] },
  { label: "Penjualan (Kasir)", href: "/sales", icon: ShoppingCart, roles: ["OWNER", "EMPLOYEE"] },
  { label: "Riwayat Transaksi", href: "/sales/history", icon: History, roles: ["OWNER", "EMPLOYEE"] },
  { label: "Catatan Pengeluaran", href: "/expenses", icon: Package, roles: ["OWNER"] },
  { label: "Manajemen Menu", href: "/menu", icon: UtensilsCrossed, roles: ["OWNER"] },
  { label: "Laporan Keuangan", href: "/reports", icon: BarChart3, roles: ["OWNER"] },
  { label: "Kelola Karyawan", href: "/employees", icon: Users, roles: ["OWNER"] },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  
  const isLoading = status === "loading";
  const userRole = (session?.user as any)?.role;
  const visibleItems = NAV_ITEMS.filter(item => userRole && item.roles.includes(userRole));

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 bg-zinc-950 border-r border-zinc-800 lg:block shadow-2xl z-50">
        <div className="flex flex-col h-full">
          
          {/* Logo Section */}
          <div className="py-12 px-6 mb-4 flex flex-col items-center">
            <Link href="/" className="group">
              <div className="h-28 w-28 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 p-4">
                <div className="relative h-full w-full">
                  <Image 
                    src="/salero-logo.png" 
                    alt="Salero Logo" 
                    fill
                    sizes="112px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Items with Smooth Animation */}
          <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="space-y-1.5 animate-in fade-in duration-500">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 w-full bg-zinc-900/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-left-4 duration-700 ease-out">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm",
                        isActive 
                          ? "bg-primary text-white shadow-xl shadow-primary/20" 
                          : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
                      )}
                    >
                      <Icon size={20} className={cn(
                        "transition-colors",
                        isActive ? "text-white" : "text-zinc-700"
                      )} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Logout Section */}
          <div className="p-8 mt-auto border-t border-zinc-900">
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all font-bold text-sm"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-[60] h-12 w-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border border-zinc-800"
      >
        {isOpen ? <X size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-zinc-950 z-[60] p-8 lg:hidden animate-in slide-in-from-left duration-300 border-r border-zinc-800">
             <div className="flex flex-col items-center mb-12">
                <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center p-3">
                  <div className="relative h-full w-full">
                    <Image 
                      src="/salero-logo.png" 
                      alt="Salero Logo" 
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                </div>
             </div>
             <nav className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4 animate-in fade-in duration-500">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-12 w-full bg-zinc-900/50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-700 ease-out">
                    {visibleItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                          pathname === item.href ? "bg-primary text-white" : "text-zinc-500 hover:bg-zinc-900"
                        )}
                      >
                        <item.icon size={20} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
                <button onClick={() => signOut()} className="flex items-center gap-4 px-6 py-4 w-full text-zinc-500 font-bold mt-4 border-t border-zinc-900 pt-8">
                  <LogOut size={20} />
                  Keluar
                </button>
             </nav>
          </div>
        </>
      )}
    </>
  );
}
