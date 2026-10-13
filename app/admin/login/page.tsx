"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        router.push("/admin/inventario");
        return;
      } catch (err: any) {
        setErrorMsg(err.message || "Error al iniciar sesión");
        setIsLoading(false);
        return;
      }
    }

    // Modo Autónomo / Demo
    setTimeout(() => {
      router.push("/admin/inventario");
    }, 400);
  };

  const handleInstantDemoAccess = () => {
    router.push("/admin/inventario");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-[#EFE6DF] shadow-card space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2C2A29] text-[#FAF7F2] flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-[#2C2A29]">
            Acceso Administrativo
          </h1>
          <p className="text-xs text-[#5A5653]">
            Boutique & Accesorios Dayam • Gestión Segura
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2A29]">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#967056] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@boutiquedayam.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DECEBF] text-xs focus:outline-none focus:ring-1 focus:ring-[#967056]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2A29]">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#967056] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DECEBF] text-xs focus:outline-none focus:ring-1 focus:ring-[#967056]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#2C2A29] hover:bg-[#4D3628] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>{isLoading ? "Validando credenciales..." : "Iniciar Sesión"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Instant Demo Access Button */}
        <div className="pt-4 border-t border-[#F5EFEB] space-y-3 text-center">
          <div className="flex items-center gap-2 justify-center text-[11px] text-[#967056] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Acceso directo para pruebas / Demo</span>
          </div>

          <button
            type="button"
            onClick={handleInstantDemoAccess}
            className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5EFEB] border border-[#DECEBF] text-[#2C2A29] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Entrar al Panel Demo (Sin Supabase)</span>
          </button>

          <Link
            href="/"
            className="text-xs text-[#5A5653] hover:text-[#2C2A29] block pt-2 underline"
          >
            Volver a la tienda pública
          </Link>
        </div>
      </div>
    </div>
  );
}
