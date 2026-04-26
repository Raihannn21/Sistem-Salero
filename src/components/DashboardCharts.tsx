"use client";

import React, { useState, useEffect } from "react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { Card } from "./ui/Card";

interface ChartData {
  name: string;
  omzet: number;
  pengeluaran: number;
}

interface DashboardChartsProps {
  data: ChartData[];
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay slightly to ensure container width is calculated by the browser
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="p-8 rounded-[3rem] border-2 border-zinc-50 shadow-xl shadow-zinc-200/30">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-zinc-900 tracking-tight">Perbandingan Kas</h3>
          <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-widest">Visualisasi Omzet vs Pengeluaran</p>
        </div>
      </div>
      
      {/* Fixed height container to prevent width calculation issues */}
      <div className="h-[400px] w-full relative overflow-hidden">
        {mounted ? (
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800000" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 800 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 800 }}
                  tickFormatter={(value) => `Rp ${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: '1px solid #f4f4f5', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '10px', color: '#18181b', fontSize: '14px' }}
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString()}`, '']}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                <Area 
                  name="Omzet (Pendapatan)"
                  type="monotone" 
                  dataKey="omzet" 
                  stroke="#800000" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorOmzet)" 
                />
                <Area 
                  name="Pengeluaran (Belanja)"
                  type="monotone" 
                  dataKey="pengeluaran" 
                  stroke="#71717a" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#colorExp)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-full bg-zinc-50 rounded-3xl animate-pulse flex items-center justify-center">
            <span className="text-[10px] font-black text-zinc-200 uppercase tracking-widest">Menyiapkan Grafik...</span>
          </div>
        )}
      </div>
    </Card>
  );
}
