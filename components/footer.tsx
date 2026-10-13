import Link from "next/link";
import { MessageCircle, Heart, Shield, Sparkles, Instagram, Facebook, Phone, BookmarkCheck } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";

export function Footer() {
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
  const cleanPhone = whatsappPhone.replace(/\D/g, "");
  const displayPhone = formatPhoneNumber();

  return (
    <footer className="bg-[#18181B] text-white mt-auto border-t border-[#27272A]">
      {/* Values Banner Glam */}
      <div className="border-b border-[#27272A] bg-gradient-to-r from-[#24121A] via-[#18181B] to-[#24121A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-[#EE2F74]/20 border border-[#EE2F74]/30 flex items-center justify-center text-[#EE2F74] shrink-0">
                <BookmarkCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold tracking-wide text-white">Sistema de Apartado</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Aparta cualquier prenda con el 30% y liquídala en 20 días.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold tracking-wide text-white">Joyería en Chapa 18k</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Piezas hipoalergénicas con baño de oro de alta durabilidad.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold tracking-wide text-white">Informes Telefónicos</h4>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Llámanos o escribe al {displayPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.25em] text-white">
                DAYAM
              </span>
              <p className="text-xs tracking-[0.3em] uppercase text-[#EE2F74] font-bold mt-1">
                Boutique & Accesorios
              </p>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed max-w-md">
              Moda contemporánea, piezas exclusivas y joyería fina diseñadas para resaltar tu estilo único. Con opción de apartado para que nunca te quedes sin tus prendas favoritas.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#27272A] hover:bg-[#25D366] flex items-center justify-center text-white transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href={`tel:+${cleanPhone}`}
                className="w-10 h-10 rounded-xl bg-[#27272A] hover:bg-[#EE2F74] flex items-center justify-center text-white transition-colors"
                title="Llamar para informes"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-[#27272A] hover:bg-[#EE2F74] flex items-center justify-center text-white transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-widest text-[#EE2F74] font-bold">
              Colecciones
            </h5>
            <ul className="space-y-2 text-sm text-[#A1A1AA]">
              <li>Cadenitas & Joyería Fina 18k</li>
              <li>Ropa de Temporada</li>
              <li>Pre-Loved Sustentable</li>
              <li>Zona Outlet & Liquidación</li>
              <li>Bolsos & Accesorios</li>
            </ul>
          </div>

          {/* Atención & Informes */}
          <div className="space-y-3">
            <h5 className="text-xs uppercase tracking-widest text-[#EE2F74] font-bold">
              Atención & Apartados
            </h5>
            <div className="text-sm text-[#A1A1AA] space-y-2">
              <p className="text-white font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#EE2F74]" />
                <span>Tel: {displayPhone}</span>
              </p>
              <p>Lunes a Sábado: 10:00 am - 8:00 pm</p>
              <p>Domingo: 11:00 am - 5:00 pm</p>
              <p className="text-xs text-[#71717A] pt-1">
                Atención personalizada para apartados y cotizaciones de envío a todo el país.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <p>© {new Date().getFullYear()} Dayam Boutique & Accesorios. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-white transition-colors underline">
              Acceso Administrativo
            </Link>
            <span>•</span>
            <span>Despliegue Dokploy / VPS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
