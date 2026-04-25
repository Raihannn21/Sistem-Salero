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
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-zinc-800 bg-[#09090b] p-6 lg:block">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground">S</div>
          <span className="text-xl font-bold tracking-tight text-white">Salero</span>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button 
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-400 transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-zinc-800 bg-[#09090b]/80 px-4 backdrop-blur-lg lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive ? "text-primary" : "text-zinc-500"
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
