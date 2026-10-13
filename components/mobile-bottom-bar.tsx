"use client";

import { usePathname } from "next/navigation";
import { ShoppingBag, MessageCircle, Home, BookmarkCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface MobileBottomBarProps {
  onScrollToCatalog?: () => void;
}

export function MobileBottomBar({ onScrollToCatalog }: MobileBottomBarProps) {
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();

  // No mostrar en rutas de administración
  if (pathname.startsWith("/admin")) return null;

  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  return (
    <nav 
      aria-label="Navegación Móvil" 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-[#FCE7F3] shadow-[0_-4px_25px_rgba(238,47,116,0.12)] px-3 py-2 pb-safe"
    >
      <div className="flex items-center justify-around">
        {/* 1. Catálogo */}
        <button
          onClick={() => {
            if (onScrollToCatalog) onScrollToCatalog();
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#71717A] hover:text-[#EE2F74] active:scale-95 transition-all flex-1"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Catálogo</span>
        </button>

        {/* 2. Apartados */}
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            "¡Hola Dayam Boutique! Me gustaría pedir informes sobre el sistema de apartado del 30%."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#71717A] hover:text-[#EE2F74] active:scale-95 transition-all flex-1"
        >
          <BookmarkCheck className="w-5 h-5 text-[#EE2F74]" />
          <span className="text-[10px] font-bold mt-0.5">Apartados</span>
        </a>

        {/* 3. Carrito (Botón Central Elevado) */}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center justify-center -mt-5 bg-gradient-to-tr from-[#D9165C] via-[#EE2F74] to-[#F43F5E] text-white p-3 rounded-full shadow-lg shadow-[#EE2F74]/35 active:scale-90 transition-transform"
          aria-label="Ver Carrito de Compras"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[#EE2F74] text-[10px] font-extrabold flex items-center justify-center shadow-md">
              {totalItems}
            </span>
          )}
        </button>

        {/* 4. WhatsApp / Pedir Informes */}
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            "¡Hola Dayam Boutique! Me gustaría pedir informes sobre las prendas disponibles."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[#25D366] hover:text-[#20BA5A] active:scale-95 transition-all flex-1"
        >
          <MessageCircle className="w-5 h-5 fill-[#25D366]" />
          <span className="text-[10px] font-bold mt-0.5 text-[#18181B]">WhatsApp</span>
        </a>
      </div>
    </nav>
  );
}
