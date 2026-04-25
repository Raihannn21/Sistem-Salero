"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogIn, Lock, User as UserIcon, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Username atau password salah!");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[3rem] p-10 lg:p-12 border border-zinc-50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary blur-xl opacity-20"></div>
              <div className="relative h-16 w-16 rounded-[22px] bg-primary flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-primary/40">S</div>
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight mb-2">Salero System</h1>
            <p className="text-zinc-400 font-semibold tracking-wide text-xs">Management & HPP Analysis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold placeholder:text-zinc-300"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold placeholder:text-zinc-300"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all tracking-wide uppercase text-xs flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  MASUK KE SISTEM
                  <LogIn size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-xs font-bold text-zinc-400">
              Butuh bantuan? <span className="text-primary hover:underline cursor-pointer">Hubungi Developer</span>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-10 text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">
          &copy; 2026 SALERO RESTO GROUP
        </p>
      </div>
    </div>
  );
}
