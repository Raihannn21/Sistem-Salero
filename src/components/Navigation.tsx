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
  Users,
  MessageCircle,
  StickyNote
} from "lucide-react";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "./ui/ConfirmModal";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["OWNER"] },
  { label: "Penjualan (Kasir)", href: "/sales", icon: ShoppingCart, roles: ["OWNER", "EMPLOYEE"] },
  { label: "Riwayat Transaksi", href: "/sales/history", icon: History, roles: ["OWNER", "EMPLOYEE"] },
  { label: "Catatan Pengeluaran", href: "/expenses", icon: Package, roles: ["OWNER"] },
  { label: "Manajemen Menu", href: "/menu", icon: UtensilsCrossed, roles: ["OWNER"] },
  { label: "Laporan Keuangan", href: "/reports", icon: BarChart3, roles: ["OWNER"] },
  { label: "Catatan Pribadi", href: "/notes", icon: StickyNote, roles: ["OWNER"] },
  { label: "Kelola Karyawan", href: "/employees", icon: Users, roles: ["OWNER"] },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { data: session, status } = useSession();
  
  const isLoading = status === "loading";
  const userRole = (session?.user as any)?.role;
  const visibleItems = NAV_ITEMS.filter(item => userRole && item.roles.includes(userRole));

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleLogout = () => {
    setIsLogoutOpen(true);
  };

  const confirmLogout = () => {
    signOut();
  };

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

          {/* Navigation Items */}
          <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="space-y-1.5">
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

          {/* Bottom Section */}
          <div className="p-8 mt-auto border-t border-zinc-900 space-y-2">
            <a 
              href="https://wa.me/6281365150455"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 transition-all font-black text-[10px] tracking-widest uppercase border border-emerald-500/20"
            >
              <MessageCircle size={18} />
              Hubungi Developer
            </a>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all font-bold text-[10px] tracking-widest uppercase"
            >
              <LogOut size={18} />
              KELUAR
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-[70] h-14 w-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border-2 border-zinc-800"
      >
        {isOpen ? <X size={24} strokeWidth={3} /> : <MenuIcon size={24} strokeWidth={3} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden transition-all duration-500",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none invisible"
        )} 
        onClick={() => setIsOpen(false)} 
      />

      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-zinc-950 z-[60] lg:hidden transition-all duration-[800ms] border-r border-zinc-800 will-change-transform overflow-y-auto custom-scrollbar shadow-[30px_0_100px_rgba(0,0,0,0.8)]",
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 invisible"
        )}
        style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
      >
        <div className="flex flex-col min-h-full p-8">
           {/* Logo Section */}
           <div className="flex flex-col items-center mb-16 mt-8">
              <div className="h-24 w-24 bg-white rounded-[2rem] flex items-center justify-center p-4 shadow-2xl shadow-white/5">
                <div className="relative h-full w-full">
                  <Image 
                    src="/salero-logo.png" 
                    alt="Salero Logo" 
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
              </div>
           </div>

           {/* Navigation Items */}
           <nav className="flex-1 space-y-3 mb-12">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 w-full bg-zinc-900/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-wider",
                        pathname === item.href 
                          ? "bg-primary text-white shadow-xl shadow-primary/20" 
                          : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-100"
                      )}
                    >
                      <item.icon size={20} className={pathname === item.href ? "text-white" : "text-zinc-700"} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
           </nav>

           {/* Bottom Section */}
           <div className="mt-auto pt-8 border-t border-zinc-900 pb-8 space-y-2">
              <a 
                href="https://wa.me/6281365150455"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-emerald-500 hover:bg-emerald-500/10 transition-all font-black text-[10px] tracking-widest uppercase border border-emerald-500/20"
              >
                <MessageCircle size={18} />
                Hubungi Developer
              </a>
              
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-4 px-6 py-4 w-full text-zinc-500 font-bold hover:text-rose-500 transition-colors uppercase tracking-widest text-sm"
              >
                <LogOut size={20} />
                KELUAR
              </button>
           </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal 
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={confirmLogout}
        title="KONFIRMASI KELUAR"
        message="Apakah Anda yakin ingin keluar dari sistem Salero? Sesi Anda akan diakhiri demi keamanan."
      />
    </>
  );
}
