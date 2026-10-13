"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ExternalLink, 
  LogOut, 
  Sparkles,
  Layers,
  Wand2,
  Store
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      label: "Inventario",
      href: "/admin/inventario",
      icon: Package,
    },
    {
      label: "Ventas POS",
      href: "/admin/ventas",
      icon: ShoppingCart,
    },
    {
      label: "Finanzas",
      href: "/admin/finanzas",
      icon: TrendingUp,
    },
  ];

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {}
    }
    router.push("/admin/login");
  };

  return (
    <>
      {/* Top Header Desktop & Tablet */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#FCE7F3] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand Tag */}
            <div className="flex items-center space-x-3">
              <Link href="/admin/inventario" className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-[0.2em] text-[#18181B]">
                  DAYAM
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] text-white shadow-sm">
                  Admin
                </span>
              </Link>
            </div>

            {/* Nav Tabs for Desktop */}
            <nav className="hidden sm:flex items-center space-x-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] text-white shadow-md shadow-[#EE2F74]/20"
                        : "text-[#71717A] hover:text-[#18181B] hover:bg-[#FFF1F5]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#EE2F74]"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action buttons */}
            <div className="flex items-center space-x-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#EE2F74] bg-[#FFF1F5] hover:bg-[#FFE4EC] transition-colors border border-[#FCE7F3]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Tienda</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-[#71717A] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Mobile Bottom Navigation Bar (Fija al pie de pantalla para el pulgar) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white/95 backdrop-blur-lg border-t border-[#FCE7F3] shadow-[0_-4px_20px_rgba(238,47,116,0.12)] px-2 py-1.5">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                  isActive
                    ? "text-[#EE2F74] font-extrabold"
                    : "text-[#71717A] font-medium hover:text-[#18181B]"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? "bg-[#FFF1F5] text-[#EE2F74]" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {/* Shortcut directo a Tienda */}
          <Link
            href="/"
            target="_blank"
            className="flex flex-col items-center justify-center p-2 rounded-2xl text-[#71717A] hover:text-[#EE2F74] transition-all font-medium"
          >
            <div className="p-1">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">Tienda</span>
          </Link>
        </div>
      </div>
    </>
  );
}
