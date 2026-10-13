"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  X, 
  MessageCircle, 
  ShoppingBag, 
  Share2, 
  Sparkles, 
  Tag, 
  ShieldCheck, 
  Heart, 
  Check, 
  Clock, 
  BookmarkCheck, 
  Phone,
  Plus,
  Minus
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency, buildWhatsAppOrderUrl, formatPhoneNumber } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart } = useCart();

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"];

  const currentPrice = product.discount_price || product.sale_price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.sale_price);
  const discountPct = hasDiscount
    ? Math.round(((product.sale_price - product.discount_price!) / product.sale_price) * 100)
    : 0;

  const layawayDeposit = currentPrice * 0.3;
  const displayPhone = formatPhoneNumber();

  const whatsappUrl = buildWhatsAppOrderUrl({
    title: product.title,
    sku: product.sku,
    size: product.size,
    price: currentPrice,
  });

  const handleAddToCart = () => {
    addToCart(product, quantity, product.size || "Única");
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 800);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Mira esta prenda hermosa en Dayam Boutique: ${product.title}`,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#FCE7F3] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute right-4 top-4 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md border border-[#FCE7F3] text-[#18181B] flex items-center justify-center hover:bg-[#FFF1F5] hover:text-[#EE2F74] transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Photo Showcase on Clean White Background */}
          <div className="bg-[#FFFFFF] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#FCE7F3]">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full max-w-sm rounded-3xl overflow-hidden bg-white flex items-center justify-center shadow-inner border border-[#FFF1F5]">
              <Image
                src={images[selectedImageIdx] || images[0]}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                priority
                className="object-contain p-2"
              />
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-14 h-16 rounded-2xl overflow-hidden bg-white border-2 transition-all shrink-0 ${
                      selectedImageIdx === idx
                        ? "border-[#EE2F74] shadow-md scale-105"
                        : "border-[#FCE7F3] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} vista ${idx + 1}`}
                      fill
                      sizes="60px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Narrative, Layaway Breakdown & Cart Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-gradient-to-b from-[#FFF5F8]/40 to-white">
            <div className="space-y-4">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#FFF1F5] border border-[#FCE7F3] text-[#EE2F74]">
                  Ref: {product.sku || "N/A"}
                </span>

                {product.condition === "Pre-loved" ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-[#BE185D] border border-[#FBCFE8]">
                    Pre-Loved Certificado
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FFF1F5] text-[#18181B]">
                    Prenda Nueva
                  </span>
                )}

                {hasDiscount && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#EE2F74] text-white flex items-center gap-1">
                    <Tag className="w-3 h-3 text-white" />
                    -{discountPct}% OFF
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B] leading-tight">
                {product.title}
              </h2>

              {/* Price Block */}
              <div className="flex items-baseline gap-3 py-2 border-y border-[#FCE7F3]">
                <span className="font-serif text-3xl font-extrabold text-[#18181B]">
                  {formatCurrency(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-[#A1A1AA] line-through">
                    {formatCurrency(product.sale_price)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-xs text-[#BE185D] font-bold bg-[#FFE4EC] px-2.5 py-0.5 rounded-full">
                    Ahorras {formatCurrency(product.sale_price - product.discount_price!)}
                  </span>
                )}
              </div>

              {/* SISTEMA DE APARTADO PROMINENTE */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FDF2F8] to-[#FFF1F5] border border-[#FBCFE8] space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#BE185D]">
                  <span className="flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-[#EE2F74]" />
                    <span>Sistema de Apartado con 30%</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#EE2F74] text-[10px] font-extrabold shadow-sm">
                    30% Anticipo
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-1 text-xs">
                  <span className="text-[#71717A]">Anticipo para apartar hoy:</span>
                  <strong className="text-base font-bold text-[#EE2F74]">
                    {formatCurrency(layawayDeposit)}
                  </strong>
                </div>
                <p className="text-[10px] text-[#A1A1AA]">
                  Liquidas el restante ({formatCurrency(currentPrice - layawayDeposit)}) en hasta 20 días naturales.
                </p>
              </div>

              {/* Talla, Color, Stock */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-[#FCE7F3]">
                  <span className="text-[#EE2F74] font-semibold block">Talla:</span>
                  <strong className="text-sm text-[#18181B]">{product.size || "Unitalla"}</strong>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[#FCE7F3]">
                  <span className="text-[#EE2F74] font-semibold block">Color:</span>
                  <strong className="text-sm text-[#18181B]">{product.color || "Según fotografía"}</strong>
                </div>

                <div className="col-span-2 p-3 rounded-2xl bg-white border border-[#FCE7F3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#EE2F74]" />
                    <span className="text-[#18181B] font-medium">Disponibilidad:</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#FFF1F5] text-[#BE185D] border border-[#FCE7F3]">
                    {product.stock} {product.stock === 1 ? "pieza en stock" : "piezas en stock"}
                  </span>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1 text-xs text-[#52525B] leading-relaxed">
                <span className="font-bold text-[#18181B] block">Detalles & Materiales:</span>
                <p>{product.description || "Pieza exclusiva de Dayam Boutique & Accesorios. Materiales hipoalergénicos y confección minuciosa."}</p>
              </div>

              {/* Informes telefónicos */}
              <div className="flex items-center gap-2 text-xs text-[#BE185D] pt-1">
                <Phone className="w-3.5 h-3.5 text-[#EE2F74]" />
                <span>¿Dudas o apartado telefónico? Tel: <strong>{displayPhone}</strong></span>
              </div>
            </div>

            {/* Actions: Add to Cart and WhatsApp Order */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Selector de cantidad */}
                <div className="flex items-center bg-[#FFF1F5] px-3 py-2 rounded-2xl border border-[#FCE7F3] shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-[#71717A] hover:text-[#EE2F74]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-[#18181B]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="p-1 text-[#71717A] hover:text-[#EE2F74]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Botón Agregar al Carrito */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                    justAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] text-white hover:opacity-95 shadow-[#EE2F74]/25"
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Agregado al Carrito</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Agregar al Carrito</span>
                    </>
                  )}
                </button>
              </div>

              {/* Botón WhatsApp Directo */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold tracking-wide transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>Pedir directamente esta sola prenda por WhatsApp</span>
              </a>

              <div className="flex items-center justify-between text-xs text-[#71717A] px-1">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-[#EE2F74] transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">¡Enlace copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Compartir prenda</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-[#EE2F74] font-medium">
                  Atención personalizada
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
