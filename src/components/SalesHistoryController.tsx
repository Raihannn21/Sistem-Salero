"use client";

import React, { useState, useMemo } from "react";
import { 
  History, 
  Calendar, 
  User as UserIcon, 
  Trash2, 
  Edit2, 
  Search, 
  Receipt, 
  ChevronDown, 
  ChevronUp, 
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Banknote,
  QrCode
} from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { deleteSale } from "@/actions/sales";
import { useToast } from "./ui/Toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SaleModal from "./SaleModal";
import { ConfirmModal } from "./ui/ConfirmModal";
import { MenuItem, Sale, Transaction } from "@prisma/client";
import { cn, formatCurrency } from "@/lib/utils";

interface TransactionWithDetails extends Transaction {
  sales: (Sale & { menuItem: MenuItem })[];
  user: {
    username: string;
    fullName: string | null;
  }
}

interface SalesHistoryControllerProps {
  initialTransactions: TransactionWithDetails[];
  menuItems: MenuItem[];
}

const ITEMS_PER_PAGE = 15;

export default function SalesHistoryController({ initialTransactions, menuItems }: SalesHistoryControllerProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const userRole = (session?.user as any)?.role || "EMPLOYEE";
  const isOwner = userRole === "OWNER";

  const employeeOptions = useMemo(() => {
    const users = new Map();
    initialTransactions.forEach(tx => {
      users.set(tx.userId, tx.user.fullName || tx.user.username);
    });
    const list = Array.from(users.entries()).map(([id, name]) => ({ id, name }));
    return [{ id: "all", name: "Semua Karyawan" }, ...list];
  }, [initialTransactions]);

  const handleEdit = (sale: any) => {
    setEditData({
      id: sale.id,
      menuItemId: sale.menuItemId,
      quantity: sale.quantity
    });
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const result = await deleteSale(selectedId);
      if (result.success) {
        showToast("Transaksi berhasil dihapus.", "success");
        router.refresh();
      }
    } finally {
      setSelectedId(null);
      setIsConfirmOpen(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      const matchesSearch = 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.user.fullName || tx.user.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.sales.some(s => s.menuItem.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEmployee = filterUser === "all" || tx.userId === filterUser;
      
      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = isWithinInterval(txDate, {
          start: startOfDay(new Date(startDate)),
          end: endOfDay(new Date(endDate))
        });
      } else if (startDate) {
        matchesDate = txDate >= startOfDay(new Date(startDate));
      } else if (endDate) {
        matchesDate = txDate <= endOfDay(new Date(endDate));
      }
      
      return matchesSearch && matchesEmployee && matchesDate;
    });
  }, [initialTransactions, searchTerm, filterUser, startDate, endDate]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterUser, startDate, endDate]);

  const stats = useMemo(() => {
    let totalQty = 0;
    let totalRevenue = 0;
    filteredTransactions.forEach(tx => {
      totalRevenue += tx.totalAmount;
      tx.sales.forEach(s => { totalQty += s.quantity; });
    });
    return { totalQty, totalRevenue };
  }, [filteredTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <PageHeader 
        category="Archive"
        title="Riwayat Transaksi"
        description="Pantau semua performa penjualan dan audit transaksi nota di sini."
      />

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        <Card className="flex items-center gap-4 md:gap-6 p-6 md:p-8 border-2 border-primary/5 bg-white shadow-premium">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-[1.5rem] bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <ShoppingCart size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Terjual</p>
            <h3 className="text-xl md:text-3xl font-black text-zinc-900 tracking-tighter">{stats.totalQty} <span className="text-sm text-zinc-400 font-bold">Porsi</span></h3>
          </div>
        </Card>

        {isOwner && (
          <Card className="flex items-center gap-4 md:gap-6 p-6 md:p-8 border-2 border-green-500/5 bg-white shadow-premium">
            <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-[1.5rem] bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <DollarSign size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Omzet</p>
              <h3 className="text-xl md:text-3xl font-black text-zinc-900 tracking-tighter">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
          </Card>
        )}

        <Card className="hidden lg:flex items-center gap-6 p-8 border-2 border-zinc-100 bg-zinc-50/30">
          <div className="h-16 w-16 rounded-[1.5rem] bg-white border border-zinc-100 text-zinc-300 flex items-center justify-center shrink-0">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Nota</p>
            <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">{filteredTransactions.length} <span className="text-sm text-zinc-400">Nota</span></h3>
          </div>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="mb-8 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 items-end">
          <div className="xl:col-span-4 group">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Cari Transaksi</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="ID Nota atau Menu..."
                className="w-full bg-white border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all font-bold placeholder:text-zinc-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="xl:col-span-5 flex flex-col sm:flex-row items-end gap-3">
             <div className="flex-1 w-full">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">Rentang Tanggal</label>
                <div className="flex items-center gap-3">
                  <DatePicker 
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Mulai"
                  />
                  <ArrowRight size={16} className="text-zinc-300 hidden sm:block shrink-0" />
                  <DatePicker 
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="Sampai"
                  />
                </div>
             </div>
          </div>

          {isOwner && (
            <div className="xl:col-span-3">
              <Select 
                label="Filter Karyawan"
                options={employeeOptions}
                value={filterUser}
                onChange={setFilterUser}
                icon={<Filter size={18} />}
                placeholder="Semua Karyawan"
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card padding="none" className="overflow-hidden border-2 border-zinc-50 shadow-premium">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 bg-zinc-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Nota / ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Metode</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Karyawan & Waktu</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Detail Pesanan</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Total Akhir</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {paginatedTransactions.map((tx) => (
                <React.Fragment key={tx.id}>
                  <tr 
                    className={cn(
                      "hover:bg-zinc-50/50 transition-colors cursor-pointer group",
                      expandedRow === tx.id ? "bg-zinc-50/50" : ""
                    )}
                    onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">ID NOTA</p>
                          <p className="text-xs font-black text-zinc-900">#{tx.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest border",
                        tx.paymentMethod === "QRIS" 
                          ? "bg-primary/5 text-primary border-primary/10" 
                          : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      )}>
                        {tx.paymentMethod === "QRIS" ? <QrCode size={12} /> : <Banknote size={12} />}
                        {tx.paymentMethod}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-zinc-900 font-black text-xs uppercase tracking-tight">
                          <UserIcon size={12} className="text-primary" />
                          {tx.user.fullName || tx.user.username}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                          <Calendar size={10} />
                          {format(new Date(tx.date), "HH:mm, dd MMM", { locale: id })}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {tx.sales.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase">
                              {s.quantity}x {s.menuItem.name}
                            </span>
                          ))}
                          {tx.sales.length > 2 && <span className="text-[10px] font-bold text-zinc-300">+{tx.sales.length - 2} lagi</span>}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-lg font-black text-zinc-900 tracking-tighter">{formatCurrency(tx.totalAmount)}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className={cn("transition-transform duration-500", expandedRow === tx.id ? "rotate-180" : "")}>
                         <ChevronDown size={20} className={cn("mx-auto", expandedRow === tx.id ? "text-primary" : "text-zinc-300")} />
                      </div>
                    </td>
                  </tr>
                  
                  {/* Desktop Detail View */}
                  <tr>
                    <td colSpan={6} className="p-0 border-none">
                      <div className={cn(
                        "grid transition-all duration-500 ease-in-out",
                        expandedRow === tx.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      )}>
                        <div className="overflow-hidden">
                          <div className="px-8 py-8 bg-zinc-50/50 border-t border-zinc-100/50">
                            <div className="grid grid-cols-2 gap-4">
                              {tx.sales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                  <div>
                                    <p className="font-black text-zinc-900 text-sm tracking-tight">{sale.menuItem.name} <span className="text-primary ml-1 font-bold text-xs">x{sale.quantity}</span></p>
                                    <p className="text-[10px] font-bold text-zinc-400 mt-1">{formatCurrency(sale.totalPrice)}</p>
                                  </div>
                                  {isOwner && (
                                    <div className="flex gap-2">
                                      <Button variant="ghost" size="sm" onClick={() => handleEdit(sale)} className="h-10 w-10 p-0 rounded-xl bg-zinc-50 text-zinc-400 hover:text-primary hover:bg-white hover:shadow-md transition-all"><Edit2 size={16} /></Button>
                                      <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(sale.id)} className="h-10 w-10 p-0 rounded-xl bg-zinc-50 text-zinc-400 hover:text-rose-500 hover:bg-white hover:shadow-md transition-all"><Trash2 size={16} /></Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {paginatedTransactions.map((tx) => (
          <div key={tx.id} className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden transition-all duration-300">
            <div 
              className={cn("p-6 cursor-pointer transition-colors duration-300", expandedRow === tx.id ? "bg-zinc-50/50" : "")}
              onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">ID NOTA</p>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md font-black text-[8px] uppercase border",
                        tx.paymentMethod === "QRIS" 
                          ? "bg-primary/5 text-primary border-primary/10" 
                          : "bg-zinc-100 text-zinc-500 border-zinc-200"
                      )}>
                        {tx.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs font-black text-zinc-900">#{tx.id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>
                <p className="text-lg font-black text-zinc-900 tracking-tighter">
                  {formatCurrency(tx.totalAmount)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-zinc-900 font-black text-[10px] uppercase tracking-tight">
                      <UserIcon size={10} className="text-primary" />
                      {tx.user.fullName || tx.user.username}
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 font-bold text-[9px] uppercase tracking-wider mt-1">
                      <Calendar size={9} />
                      {format(new Date(tx.date), "HH:mm, dd MMM", { locale: id })}
                    </div>
                  </div>
                </div>
                <div className={cn("h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 transition-transform duration-500", expandedRow === tx.id ? "rotate-180 bg-primary/10 text-primary" : "")}>
                   <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Mobile Detail Expansion */}
            <div className={cn(
              "grid transition-all duration-500 ease-in-out bg-zinc-50/50",
              expandedRow === tx.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-2 space-y-3">
                  {tx.sales.map((sale) => (
                    <div key={sale.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
                      <div>
                        <h5 className="font-black text-zinc-900 text-xs tracking-tight">{sale.menuItem.name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">x{sale.quantity}</span>
                          <span className="text-[10px] font-bold text-zinc-400">{formatCurrency(sale.totalPrice)}</span>
                        </div>
                      </div>
                      {isOwner && (
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => handleEdit(sale)} className="h-9 w-9 p-0 rounded-lg bg-zinc-50 text-zinc-400 active:scale-95"><Edit2 size={14} /></Button>
                          <Button variant="ghost" onClick={() => openDeleteConfirm(sale.id)} className="h-9 w-9 p-0 rounded-lg bg-zinc-50 text-zinc-400 active:scale-95"><Trash2 size={14} /></Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-zinc-50 border-dashed">
          <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
            <History size={40} />
          </div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Tidak ada data riwayat ditemukan.</p>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-zinc-50 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            {filteredTransactions.length} Total Data
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 max-w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-10 px-3 rounded-xl disabled:opacity-30 shrink-0"
            >
              <ChevronLeft size={16} />
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "h-10 w-10 min-w-[40px] rounded-xl font-black text-xs transition-all shrink-0",
                    currentPage === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-400 hover:bg-zinc-100"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-10 px-3 rounded-xl disabled:opacity-30 shrink-0"
            >
              <ChevronRightIcon size={16} />
            </Button>
          </div>
        </div>
      )}

      <SaleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuItems={menuItems}
        editData={editData}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Catatan"
        message="Apakah Anda yakin ingin menghapus catatan pesanan ini dari nota?"
      />
    </>
  );
}
