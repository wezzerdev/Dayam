"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, ShoppingBag, Eye, Sparkles, Tag, ChevronLeft, ChevronRight, BookmarkCheck, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency, buildWhatsAppOrderUrl } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart } = useCart();

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"];

  const currentPrice = product.discount_price || product.sale_price;
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.sale_price);
  const discountPct = hasDiscount
    ? Math.round(((product.sale_price - product.discount_price!) / product.sale_price) * 100)
    : 0;

  // Monto requerido para apartar (30%)
  const layawayDeposit = currentPrice * 0.3;

  const whatsappUrl = buildWhatsAppOrderUrl({
    title: product.title,
    sku: product.sku,
    size: product.size,
    price: currentPrice,
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, product.size || "Única");
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <article
      onClick={() => onOpenModal(product)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-[#FCE7F3] shadow-soft hover:shadow-hover hover:border-[#FBCFE8] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Photo Container - Clean Pure White Background */}
      <div className="relative aspect-[3/4] w-full bg-[#FFFFFF] overflow-hidden flex items-center justify-center p-2.5 sm:p-3 border-b border-[#FFF1F5]">
        <div className="relative w-full h-full">
          <Image
            src={images[currentImageIdx]}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Carousel arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 border border-[#FCE7F3] text-[#18181B] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 border border-[#FCE7F3] text-[#18181B] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentImageIdx ? "w-3 bg-[#EE2F74]" : "bg-[#FBCFE8]"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges Flotantes Femeninos y Vibrantes */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.condition === "Pre-loved" && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-[#BE185D] border border-[#FBCFE8] shadow-sm">
              Pre-Loved 10/10
            </span>
          )}

          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-[#EE2F74] text-white shadow-sm flex items-center gap-1">
              <Tag className="w-3 h-3 text-white" />
              -{discountPct}% OFF
            </span>
          )}

          {product.tags?.includes("Destacado") && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#F59E0B]" />
              Top Trend
            </span>
          )}
        </div>

        {/* Stock pill warning if low */}
        {product.stock <= 2 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
              Últimas {product.stock} piezas
            </span>
          </div>
        )}

        {/* Hover Quick view */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-[#18181B] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-[#EE2F74]" />
            <span>Ver detalles</span>
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata Row: SKU & Size */}
          <div className="flex items-center justify-between text-[11px] font-medium tracking-wide">
            <span className="text-[#A1A1AA] font-mono">Ref: {product.sku || "N/A"}</span>
            {product.size && (
              <span className="bg-[#FFF1F5] px-2 py-0.5 rounded-md border border-[#FCE7F3] text-[#EE2F74] font-bold">
                Talla: {product.size}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base font-bold text-[#18181B] group-hover:text-[#EE2F74] transition-colors line-clamp-2 mt-1">
            {product.title}
          </h3>

          {/* Color & Short Description */}
          {product.color && (
            <p className="text-xs text-[#71717A] mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EE2F74] inline-block" />
              <span>Color: {product.color}</span>
            </p>
          )}

          {/* Sistema de Apartado Badge por Prenda */}
          <div className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-[#FDF2F8] to-[#FFF1F5] border border-[#FCE7F3] flex items-center justify-between text-[11px] text-[#BE185D]">
            <span className="flex items-center gap-1 font-semibold">
              <BookmarkCheck className="w-3.5 h-3.5 text-[#EE2F74]" />
              <span>Aparta con 30%:</span>
            </span>
            <strong className="text-xs text-[#EE2F74] font-bold">
              {formatCurrency(layawayDeposit)}
            </strong>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#FFF1F5] space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-serif font-extrabold text-[#18181B]">
              {formatCurrency(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-[#A1A1AA] line-through font-normal">
                {formatCurrency(product.sale_price)}
              </span>
            )}
          </div>

          {/* Dual Buttons: Agregar al Carrito & Pedir por WhatsApp */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] hover:opacity-95 text-white shadow-[#EE2F74]/20"
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Agregado</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>+ Carrito</span>
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              title="Pedir directamente esta sola prenda"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
