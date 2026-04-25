"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings,
  LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Menu", href: "/menu", icon: UtensilsCrossed },
  { name: "Bahan Baku", href: "/ingredients", icon: Package },
  { name: "Penjualan", href: "/sales", icon: ShoppingCart },
  { name: "Laporan", href: "/reports", icon: TrendingUp },
];

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

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
        
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3.5 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300",
                  isActive 
                    ? "bg-white text-primary shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100" 
                    : "text-zinc-400 hover:text-zinc-900 hover:bg-white/60"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-transform group-hover:scale-110", isActive && "text-primary")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
 
        <div className="absolute bottom-10 left-8 right-8">
          <button 
            onClick={() => signOut()}
            className="group flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-400 transition-all hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10"
          >
            <div className="p-2 rounded-xl bg-zinc-50 group-hover:bg-primary/10 transition-colors">
              <LogOut size={18} />
            </div>
            Keluar
          </button>
        </div>
      </aside>
 
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 flex h-20 items-center justify-around rounded-[2rem] border border-white/50 bg-white/70 px-4 backdrop-blur-2xl shadow-2xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all w-14 h-14 rounded-2xl",
                isActive ? "text-primary bg-primary/5 shadow-inner" : "text-zinc-400"
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-black uppercase tracking-wider">{item.name.substring(0, 4)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
