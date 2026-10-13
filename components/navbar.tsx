"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Menu, X, ShieldCheck, MessageCircle, Phone, BookmarkCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPhoneNumber } from "@/lib/utils";

interface NavbarProps {
  onCategorySelect?: (category: string) => void;
  activeCategory?: string;
}

export function Navbar({ onCategorySelect, activeCategory }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const displayPhone = formatPhoneNumber(cleanPhone); // "56 1289 4359"

  const navLinks = [
    { label: "Paseo Virtual", value: "paseo", badge: "3D" },
    { label: "Todo el Catálogo", value: "todos" },
    { label: "Joyería Fina", value: "joyeria" },
    { label: "Ropa de Marca", value: "ropa" },
    { label: "Pre-Loved", value: "preloved", badge: "Exclusivo" },
    { label: "Zona Outlet", value: "outlet", badge: "Rebajas" },
  ];

  const handleLinkClick = (value: string) => {
    if (onCategorySelect) {
      onCategorySelect(value);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-[#FCE7F3] shadow-sm">
      {/* Top Banner Limpio (Sin Emojis, Solo Iconos Lucide) */}
      <div className="bg-gradient-to-r from-[#D9165C] via-[#EE2F74] to-[#F43F5E] text-white text-xs py-1.5 px-3 text-center tracking-wide font-medium flex items-center justify-between sm:justify-center gap-2">
        <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
          <span><strong>Sistema de Apartado:</strong> Aparta con 30% de anticipo</span>
        </div>

        {/* Teléfono directo para informes */}
        <a
          href={`tel:+${cleanPhone}`}
          className="hidden md:inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-0.5 rounded-full text-[11px] font-bold text-white transition-colors"
        >
          <Phone className="w-3 h-3" />
          <span>Informes: {displayPhone}</span>
        </a>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#18181B] hover:text-[#EE2F74] rounded-xl focus:outline-none"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo / Brand Name Femenino Chic */}
        <Link href="/" className="flex flex-col items-center group text-center">
          <span className="font-serif text-xl sm:text-3xl font-bold tracking-[0.2em] text-[#18181B] group-hover:text-[#EE2F74] transition-colors">
            DAYAM
          </span>
          <span className="text-[9px] sm:text-[11px] tracking-[0.3em] uppercase text-[#EE2F74] font-bold -mt-0.5 sm:mt-0">
            Boutique & Accesorios
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.map((link) => {
            const isActive = activeCategory === link.value;
            return (
              <button
                key={link.value}
                onClick={() => handleLinkClick(link.value)}
                className={`relative text-xs sm:text-sm tracking-wide transition-all py-1 font-semibold flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#EE2F74] font-bold"
                    : "text-[#52525B] hover:text-[#EE2F74]"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                      link.value === "outlet"
                        ? "bg-[#FFE4EC] text-[#E11D48]"
                        : "bg-[#FDF2F8] text-[#BE185D] border border-[#FBCFE8]"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#EE2F74] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Botón de Informes: Visible solo en Desktop para no saturar la cabecera en móvil */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              "¡Hola Dayam Boutique! Me gustaría pedir informes sobre el sistema de apartado y prendas."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#EE2F74] bg-[#FFF1F5] hover:bg-[#FFE4EC] transition-all border border-[#FCE7F3]"
          >
            <Phone className="w-3.5 h-3.5 text-[#EE2F74]" />
            <span>Pedir Informes</span>
          </a>

          {/* Botón de Carrito: En móvil es solo el icono táctil con badge, en desktop incluye texto */}
          <button
            onClick={openCart}
            aria-label="Ver Carrito de Compras"
            className="relative flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] text-white hover:opacity-95 shadow-md shadow-[#EE2F74]/25 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-xs font-bold">Carrito</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto w-5 h-5 rounded-full bg-white text-[#EE2F74] text-[10px] font-extrabold flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {/* Admin shortcut discreto */}
          <Link
            href="/admin"
            className="p-2 rounded-xl text-[#71717A] hover:text-[#EE2F74] hover:bg-[#FFF1F5] transition-all"
            title="Panel de Administración"
          >
            <ShieldCheck className="w-4 h-4 text-[#EE2F74]" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer (Menú lateral si el usuario presiona hamburguesa) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#FCE7F3] px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          <div className="p-3 rounded-2xl bg-[#FFF1F5] border border-[#FBCFE8] space-y-1">
            <span className="text-xs font-bold text-[#BE185D] flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-[#EE2F74]" />
              <span>Sistema de Apartado con 30%</span>
            </span>
            <p className="text-[11px] text-[#71717A]">
              Liquida tu pedido en hasta 20 días naturales.
            </p>
            <a
              href={`tel:+${cleanPhone}`}
              className="text-xs font-bold text-[#EE2F74] flex items-center gap-1.5 pt-1"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Atención telefónica: {displayPhone}</span>
            </a>
          </div>

          <p className="text-[10px] font-bold text-[#EE2F74] uppercase tracking-wider px-2">
            Categorías
          </p>
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.value}
                onClick={() => handleLinkClick(link.value)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors ${
                  activeCategory === link.value
                    ? "bg-[#FFF1F5] text-[#EE2F74] font-bold"
                    : "text-[#52525B] hover:bg-[#FFF1F5]"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFE4EC] text-[#BE185D] font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#FCE7F3] space-y-2">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                "¡Hola Dayam Boutique! Me gustaría pedir informes de prendas."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-[#25D366] text-white shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pedir Informes por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
