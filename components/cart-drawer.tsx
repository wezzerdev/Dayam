"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  MessageCircle, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight,
  BookmarkCheck,
  Check
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    layawayPercent,
    layawayDeposit,
    customerName,
    setCustomerName,
    getWhatsAppCheckoutUrl,
  } = useCart();

  const [checkoutMode, setCheckoutMode] = useState<"full" | "layaway">("full");

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#FCE7F3] animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-[#FCE7F3] bg-gradient-to-r from-[#FFF1F5] via-white to-[#FFF1F5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#EE2F74] text-white flex items-center justify-center shadow-md shadow-[#EE2F74]/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#18181B]">
                  Mi Carrito de Compras
                </h2>
                <p className="text-xs text-[#EE2F74] font-medium">
                  {totalItems} {totalItems === 1 ? "prenda seleccionada" : "prendas seleccionadas"}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] hover:bg-white transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Banner Sistema de Apartado */}
          <div className="bg-[#FFF1F5] px-4 py-2.5 border-b border-[#FBCFE8] flex items-center gap-2 text-xs text-[#BE185D]">
            <BookmarkCheck className="w-4 h-4 text-[#EE2F74] shrink-0" />
            <span>
              <strong>Sistema de Apartado:</strong> Aparta con el 30% y liquida en hasta 20 días.
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF1F5] border border-[#FCE7F3] flex items-center justify-center mx-auto text-[#EE2F74]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-semibold text-[#18181B]">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-xs text-[#71717A] max-w-xs mx-auto">
                    Explora nuestra joyería fina y prendas exclusivas para apartar tus favoritas.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-full bg-[#EE2F74] text-white text-xs font-bold hover:bg-[#D9165C] transition-all shadow-md shadow-[#EE2F74]/20"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const image = item.product.images?.[0] || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80";
                const unitPrice = item.product.discount_price || item.product.sale_price;

                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${idx}`}
                    className="p-3.5 rounded-2xl bg-[#FFF1F5]/40 border border-[#FCE7F3] flex gap-3.5 items-center hover:bg-[#FFF1F5]/70 transition-colors"
                  >
                    {/* Thumbnail on clean white */}
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-white border border-[#FCE7F3] shrink-0">
                      <Image
                        src={image}
                        alt={item.product.title}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs text-[#18181B] line-clamp-1">
                        {item.product.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#71717A]">
                        <span className="px-1.5 py-0.2 rounded bg-white border border-[#FCE7F3] font-semibold text-[#EE2F74]">
                          Talla: {item.selectedSize}
                        </span>
                        <span className="font-mono text-[10px]">Ref: {item.product.sku}</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-sm text-[#18181B]">
                          {formatCurrency(unitPrice * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-[#71717A]">
                            ({formatCurrency(unitPrice)} c/u)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex flex-col items-end justify-between h-full space-y-2">
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="p-1 rounded text-[#A1A1AA] hover:text-[#EE2F74] transition-colors"
                        title="Quitar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-[#FCE7F3]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                          className="text-[#71717A] hover:text-[#EE2F74] p-0.5"
                          title="Menos"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-[#18181B] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                          className="text-[#71717A] hover:text-[#EE2F74] p-0.5"
                          title="Más"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Options if items exist */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#FCE7F3] bg-[#FFF1F5]/30 space-y-4">
              {/* Opción de Modalidad: Liquidar vs Apartar con el 30% */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#EE2F74] block">
                  ¿Cómo deseas tramitar tu pedido?
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutMode("full")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                      checkoutMode === "full"
                        ? "bg-[#18181B] text-white border-[#18181B] shadow-sm"
                        : "bg-white text-[#71717A] border-[#FCE7F3] hover:bg-[#FFF1F5]"
                    }`}
                  >
                    <span>Liquidar Total</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      Pago del 100%
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutMode("layaway")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                      checkoutMode === "layaway"
                        ? "bg-[#EE2F74] text-white border-[#EE2F74] shadow-md shadow-[#EE2F74]/20"
                        : "bg-white text-[#EE2F74] border-[#FBCFE8] hover:bg-[#FDF2F8]"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Apartado 30%</span>
                    </span>
                    <span className="text-[10px] opacity-90 font-normal">
                      Anticipo: {formatCurrency(layawayDeposit)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Nombre de la clienta opcional para personalizar */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#18181B]">
                  Tu Nombre (opcional para tu apartado)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. Valeria Martínez"
                  className="w-full px-3 py-1.5 rounded-xl border border-[#FCE7F3] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#EE2F74]"
                />
              </div>

              {/* Resumen de totales */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#FCE7F3] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#71717A]">
                  <span>Subtotal ({totalItems} prendas):</span>
                  <span className="font-medium text-[#18181B]">{formatCurrency(subtotal)}</span>
                </div>

                {checkoutMode === "layaway" ? (
                  <>
                    <div className="flex justify-between text-[#BE185D] font-semibold pt-1 border-t border-[#FCE7F3]">
                      <span>Anticipo de Apartado (30%):</span>
                      <span className="text-sm font-bold text-[#EE2F74]">
                        {formatCurrency(layawayDeposit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[#71717A]">
                      <span>Restante a liquidar (en 20 días):</span>
                      <span>{formatCurrency(subtotal - layawayDeposit)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-bold text-[#18181B] text-sm pt-1 border-t border-[#FCE7F3]">
                    <span>Total a Liquidar:</span>
                    <span className="text-base text-[#18181B]">{formatCurrency(subtotal)}</span>
                  </div>
                )}
              </div>

              {/* Botón Principal de Enviar Carrito por WhatsApp */}
              <a
                href={getWhatsAppCheckoutUrl(checkoutMode === "layaway")}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-6 rounded-2xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
                  checkoutMode === "layaway"
                    ? "bg-gradient-to-r from-[#D9165C] via-[#EE2F74] to-[#F43F5E] hover:opacity-95 shadow-[#EE2F74]/30"
                    : "bg-[#25D366] hover:bg-[#20BA5A] shadow-[#25D366]/30"
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                <span>
                  {checkoutMode === "layaway"
                    ? `Apartar Carrito con 30% (${formatCurrency(layawayDeposit)})`
                    : `Pedir Todo por WhatsApp (${formatCurrency(subtotal)})`}
                </span>
              </a>

              <div className="flex items-center justify-between text-[11px] text-[#71717A] px-1">
                <button
                  onClick={clearCart}
                  className="hover:text-[#EE2F74] underline"
                >
                  Vaciar carrito
                </button>
                <span>Respuesta inmediata por WhatsApp</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
