"use client";

import { Sparkles, ArrowRight, Phone, BookmarkCheck, Compass, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { formatPhoneNumber } from "@/lib/utils";

interface HeroBannerProps {
  onScrollToCatalog: () => void;
  onSelectOutlet: () => void;
  onScrollToPaseo?: () => void;
}

export function HeroBanner({ onScrollToCatalog, onScrollToPaseo }: HeroBannerProps) {
  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const displayPhone = formatPhoneNumber(cleanPhone); // "56 1289 4359"

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-[#FFFFFF] to-[#FFF5F8] border-b border-[#FCE7F3] py-8 sm:py-14">
      {/* Luz ambiental sutil */}
      <div className="absolute top-0 right-10 w-80 h-80 bg-[#FBCFE8]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            {/* Pill informativa limpia: Sistema de Apartado (Sin emojis, solo icono) */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFE4EC] border border-[#FBCFE8] text-[#BE185D] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#EE2F74]" />
              <span>Sistema de Apartado con 30% de anticipo</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#18181B] leading-tight tracking-tight">
              Moda que te hace brillar, pensada para ti.
            </h1>

            <p className="text-sm sm:text-base text-[#52525B] max-w-lg mx-auto lg:mx-0 font-normal leading-relaxed">
              Joyería fina en chapa de oro de 18k, prendas exclusivas de temporada y selección Pre-Loved de marca. Arma tu carrito y pide todo por WhatsApp.
            </p>

            {/* Fila única de Información Directa y Teléfono (Sin redundancias) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#FCE7F3] text-[#18181B] font-semibold">
                <BookmarkCheck className="w-4 h-4 text-[#EE2F74]" />
                <span>Liquida tu apartado en 20 días</span>
              </div>

              <a
                href={`tel:+${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1F5] hover:bg-[#FFE4EC] border border-[#FBCFE8] text-[#BE185D] font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#EE2F74]" />
                <span>Informes: {displayPhone}</span>
              </a>
            </div>

            {/* Botones de Acción: Explorar Catálogo y Paseo Virtual */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onScrollToCatalog}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#EE2F74] via-[#F43F5E] to-[#FB7185] text-white hover:opacity-95 text-sm font-extrabold tracking-wide shadow-lg shadow-[#EE2F74]/25 flex items-center justify-center gap-2 group transition-all active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {onScrollToPaseo && (
                <button
                  onClick={onScrollToPaseo}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-[#FFF1F5] text-[#18181B] border border-[#FCE7F3] text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <Compass className="w-4 h-4 text-[#EE2F74]" />
                  <span>Paseo Virtual</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Visual Collage */}
          <div className="lg:col-span-5 relative max-w-sm sm:max-w-md mx-auto lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden bg-white p-2.5 shadow-card border border-[#FCE7F3]">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#FFF1F5]">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
                  alt="Colección Dayam Boutique"
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  priority
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                {/* Sub-badge sutil dentro de la fotografía */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow flex items-center justify-between border border-pink-100">
                  <div>
                    <span className="text-[9px] font-extrabold tracking-widest uppercase text-[#EE2F74] block">
                      Nueva Temporada
                    </span>
                    <p className="text-xs font-serif font-bold text-[#18181B]">
                      Joyería 18k & Moda Exclusiva
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFE4EC] text-[#BE185D]">
                    Disponible
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
