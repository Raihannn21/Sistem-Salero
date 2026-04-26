"use client";

import Link from "next/link";
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
import { Button } from "./ui/Button";

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
  const { data: session } = useSession();
  
  const userRole = (session?.user as any)?.role || "EMPLOYEE";

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/50 bg-white/40 p-8 lg:block backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
        <div className="mb-12 flex items-center gap-4 px-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-lg opacity-20"></div>
            <div className="relative h-10 w-10 rounded-[14px] bg-primary flex items-center justify-center font-black text-white shadow-xl shadow-primary/30">S</div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-zinc-900 leading-none">Salero</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-1">HPP System</span>
          </div>
        </div>

        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3.5 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300",
                  isActive 
                    ? "bg-white text-primary shadow-xl shadow-zinc-200/40 border border-zinc-100" 
                    : "text-zinc-400 hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10"
                )}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-colors", isActive ? "text-primary" : "text-zinc-300 group-hover:text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-10 left-8 right-8">
          <button 
            onClick={() => signOut()}
            className="group flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-400 transition-all hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10"
          >
            <LogOut size={20} className="text-zinc-300 group-hover:text-primary transition-colors" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white/80 p-4 backdrop-blur-xl lg:hidden border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center font-black text-white text-sm shadow-lg shadow-primary/20">S</div>
          <span className="font-black text-zinc-900 tracking-tight">Salero</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-8 shadow-2xl animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
            <nav className="mt-12 space-y-4">
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl px-6 py-4 font-bold transition-all",
                    pathname === item.href ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-zinc-500 hover:bg-zinc-50"
                  )}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={() => signOut()}
                className="flex w-full items-center gap-4 rounded-2xl px-6 py-4 font-bold text-zinc-500 hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <LogOut size={20} />
                Keluar
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
