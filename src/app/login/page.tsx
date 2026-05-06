"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, Lock, User as UserIcon, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSlowConnection(false);

    // Timer for slow connection feedback
    const slowTimer = setTimeout(() => {
      setSlowConnection(true);
    }, 5000); // 5 seconds

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      clearTimeout(slowTimer);

      if (res?.error) {
        setError("Username atau password salah!");
      } else {
        // Direct redirect without refresh for better performance on weak devices
        window.location.href = "/";
      }
    } catch (err) {
      clearTimeout(slowTimer);
      setError("Koneksi tidak stabil. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Lighter Background Elements for Weak Devices */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-zinc-100 shadow-xl">
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-4">
              <div className="relative flex items-center justify-center">
                <Image 
                  src="/salero-logo.png" 
                  alt="Salero Logo" 
                  width={150} 
                  height={150} 
                  sizes="150px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl text-center">
                {error}
              </div>
            )}

            {loading && slowConnection && !error && (
              <div className="bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl text-center animate-pulse">
                Jaringan sedang lambat. Mohon tunggu...
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4.5 rounded-2xl focus:outline-none focus:border-primary/30 transition-all font-bold placeholder:text-zinc-300 text-sm"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4.5 rounded-2xl focus:outline-none focus:border-primary/30 transition-all font-bold placeholder:text-zinc-300 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-zinc-950 text-white font-black rounded-2xl shadow-xl hover:bg-zinc-900 transition-all tracking-widest uppercase text-[10px] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  MEMPROSES...
                </>
              ) : (
                <>
                  MASUK KE SISTEM
                  <LogIn size={16} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Butuh bantuan? <a href="https://wa.me/6281365150455" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Hubungi Developer</a>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
          &copy; 2026 SALERO RESTO GROUP
        </p>
      </div>
    </div>
  );
}
