"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ShoppingCart, Trash2, Minus, Plus, ChevronRight, Search, Receipt, X, Banknote, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { completeTransaction } from "@/actions/sales";
import { useToast } from "./ui/Toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import ReceiptModal from "./ReceiptModal";

import { MenuItem } from "@prisma/client";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface SalesControllerProps {
  menuItems: MenuItem[];
}

export default function SalesController({ menuItems }: SalesControllerProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS">("CASH");

  // Receipt State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileCartOpen]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  const addToCart = (menu: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id);
      if (existing) {
        return prev.map(item => 
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: menu.id, name: menu.name, price: menu.basePrice, quantity: 1 }];
    });
    showToast(`${menu.name.toUpperCase()} BERHASIL DITAMBAHKAN`, "success");
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    const itemsForAction = cart.map(item => ({
      menuItemId: item.id,
      quantity: item.quantity
    }));

    try {
      const result = await completeTransaction(itemsForAction, paymentMethod);
      if (result.success) {
        // Set Receipt Data for display
        setReceiptData({
          id: result.transactionId,
          date: new Date(),
          items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price * i.quantity })),
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          cashierName: session?.user?.name || "Kasir"
        });
        
        setIsReceiptOpen(true);
        setCart([]);
        setIsMobileCartOpen(false);
        setPaymentMethod("CASH");
        showToast("TRANSAKSI BERHASIL!", "success");
      } else {
        showToast(result.error || "Gagal memproses pesanan.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-10 min-h-[calc(100vh-120px)] bg-[#f8f8f8] -m-8 lg:-m-12 p-8 lg:p-12 pb-32 lg:pb-12">
        
        {/* Left: Menu Section */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Kasir Salero</h1>
              <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest opacity-60">PILIH MENU MASAKAN</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative group w-full xl:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Cari menu masakan..." 
                className="w-full bg-white border-2 border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all font-bold placeholder:text-zinc-300 uppercase text-xs tracking-widest"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredMenuItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => addToCart(item)}
                className="group relative flex flex-col p-6 rounded-[2.5rem] bg-white border-2 border-primary/20 hover:border-primary shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(180,0,0,0.15)] transition-all duration-300 text-left active:scale-[0.95] overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3">
                  <div className="h-6 w-6 rounded-full bg-zinc-50 border border-zinc-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary text-zinc-300 flex items-center justify-center transition-all duration-300">
                    <Plus size={12} strokeWidth={4} />
                  </div>
                </div>

                <div className="mt-2 space-y-4">
                  <h3 className="font-black text-zinc-900 text-base leading-tight group-hover:text-primary transition-colors break-words uppercase">
                    {item.name}
                  </h3>
                  <div className="pt-4 border-t border-zinc-100">
                    <p className="text-lg font-black text-primary tracking-tight">
                      Rp {item.basePrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {filteredMenuItems.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-zinc-200">
                <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Menu tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Cart Sidebar */}
        <div className="hidden lg:block w-[420px] shrink-0">
          <CartContent 
            cart={cart}
            totalAmount={totalAmount}
            loading={loading}
            paymentMethod={paymentMethod}
            onSetPaymentMethod={setPaymentMethod}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Mobile Floating Action Button */}
        <div className="lg:hidden fixed bottom-8 right-8 z-[100]">
          <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="h-20 w-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-[0_20px_50px_rgba(180,0,0,0.4)] relative active:scale-90 transition-all border-4 border-white"
          >
            <ShoppingCart size={28} strokeWidth={2.5} />
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-black border-4 border-white animate-in zoom-in duration-300">
                {totalItems}
              </div>
            )}
          </button>
        </div>

        {/* Mobile Cart Overlay/Drawer */}
        <div 
          className={cn(
            "fixed inset-0 bg-zinc-950/40 backdrop-blur-md z-[110] lg:hidden transition-opacity duration-500",
            isMobileCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )} 
          onClick={() => setIsMobileCartOpen(false)} 
        />
        <div 
          className={cn(
            "fixed inset-x-0 bottom-0 lg:hidden z-[120] max-h-[92vh] flex flex-col transition-transform duration-[800ms] will-change-transform",
            isMobileCartOpen ? "translate-y-0" : "translate-y-full"
          )}
          style={{ transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }}
        >
          <div className="flex-1 bg-white rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border-t-4 border-primary/5">
            {/* Grabber Handle */}
            <div className="p-4 flex justify-center bg-white sticky top-0 z-10">
              <div className="h-1.5 w-12 bg-zinc-100 rounded-full" />
            </div>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsMobileCartOpen(false)}
              className="absolute right-8 top-6 z-20 h-10 w-10 rounded-full bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center text-zinc-900 transition-colors shadow-sm"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2">
              <CartContent 
                cart={cart}
                totalAmount={totalAmount}
                loading={loading}
                paymentMethod={paymentMethod}
                onSetPaymentMethod={setPaymentMethod}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onCheckout={handleCheckout}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        data={receiptData}
      />
    </>
  );
}

// Sub-component for Cart Content
function CartContent({ 
  cart, 
  totalAmount, 
  loading, 
  paymentMethod,
  onSetPaymentMethod,
  onUpdateQuantity, 
  onRemove, 
  onCheckout,
  isMobile = false
}: { 
  cart: CartItem[], 
  totalAmount: number, 
  loading: boolean, 
  paymentMethod: "CASH" | "QRIS",
  onSetPaymentMethod: (method: "CASH" | "QRIS") => void,
  onUpdateQuantity: (id: string, delta: number) => void,
  onRemove: (id: string) => void,
  onCheckout: () => void,
  isMobile?: boolean
}) {
  return (
    <div className={cn(
      "flex flex-col h-full bg-white",
      !isMobile && "sticky top-10 border-2 border-primary/10 rounded-[3rem] shadow-[0_30px_100px_rgba(180,0,0,0.05)] h-[calc(100vh-120px)] overflow-hidden"
    )}>
      {/* Cart Header */}
      <div className="p-8 pb-6 flex items-center justify-between border-b border-zinc-50 bg-zinc-50/30">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <Receipt size={18} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Nota Pesanan</h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-[10px] tracking-widest uppercase">
          {cart.reduce((sum, i) => sum + i.quantity, 0)} Item
        </div>
      </div>

      {/* Cart Items List */}
      <div className={cn(
        "flex-1 overflow-y-auto px-8 py-6 custom-scrollbar",
        isMobile ? "min-h-0" : "min-h-[200px]"
      )}>
        <div className="space-y-8">
          {cart.map(item => (
            <div key={item.id} className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-zinc-900 text-sm leading-tight uppercase">{item.name}</h4>
                  <p className="text-xs font-black text-primary mt-1">Rp {(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <button onClick={() => onRemove(item.id)} className="h-10 w-10 rounded-xl bg-red-50 text-red-200 hover:text-red-500 transition-colors flex items-center justify-center border border-red-100/50">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-3 w-full">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-primary transition-all shadow-sm active:scale-90">
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="flex-1 text-base font-black text-zinc-900 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-primary transition-all shadow-sm active:scale-90">
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
              <ShoppingCart size={64} strokeWidth={1} className="mb-4" />
              <p className="font-black text-zinc-400 uppercase text-[10px] tracking-widest">Keranjang Kosong</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Footer */}
      <div className="p-8 lg:p-10 pt-8 border-t border-zinc-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)] space-y-8">
        
        {/* Payment Method Selector */}
        <div className="space-y-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block ml-1">Metode Pembayaran</span>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onSetPaymentMethod("CASH")}
              className={cn(
                "flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all border-2",
                paymentMethod === "CASH" 
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-900/20" 
                  : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
              )}
            >
              <Banknote size={16} />
              Tunai
            </button>
            <button 
              onClick={() => onSetPaymentMethod("QRIS")}
              className={cn(
                "flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all border-2",
                paymentMethod === "QRIS" 
                  ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                  : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
              )}
            >
              <QrCode size={16} />
              QRIS
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] block mb-1">Total Pembayaran</span>
            <span className="text-3xl font-black text-primary tracking-tighter">Rp {totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <button 
          disabled={cart.length === 0 || loading} 
          onClick={onCheckout}
          className={cn(
            "w-full h-16 rounded-[2rem] flex items-center justify-center gap-4 font-black text-sm tracking-widest uppercase transition-all duration-500",
            cart.length > 0 
              ? "bg-primary text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]" 
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          )}
        >
          {loading ? (
            <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              SELESAIKAN ORDER
              <ChevronRight size={20} strokeWidth={3} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
