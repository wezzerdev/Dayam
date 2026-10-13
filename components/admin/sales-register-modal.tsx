"use client";

import { useState } from "react";
import { X, Check, Search, DollarSign, CreditCard, Banknote, ArrowRight, Sparkles, AlertCircle, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { Product, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface SalesRegisterModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmSale: (params: {
    product_id?: string;
    product_title: string;
    product_sku?: string;
    quantity: number;
    unit_cost: number;
    unit_sale_price: number;
    payment_method: PaymentMethod;
    customer_name?: string;
    notes?: string;
  }) => Promise<void>;
  preselectedProduct?: Product | null;
}

export function SalesRegisterModal({
  products,
  isOpen,
  onClose,
  onConfirmSale,
  preselectedProduct,
}: SalesRegisterModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.id || (products.length > 0 ? products[0].id : "")
  );
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Transferencia");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("Apartado confirmado por WhatsApp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customPrice, setCustomPrice] = useState<string>("");

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || preselectedProduct;

  const unitSalePrice = customPrice !== "" && Number(customPrice) >= 0
    ? Number(customPrice)
    : (currentProduct?.discount_price || currentProduct?.sale_price || 0);

  const unitCost = currentProduct?.cost_price || 0;
  const totalAmount = unitSalePrice * quantity;
  const totalCost = unitCost * quantity;
  const netProfit = totalAmount - totalCost;
  const marginPct = totalAmount > 0 ? ((netProfit / totalAmount) * 100).toFixed(1) : "0";

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      alert("Por favor selecciona un producto");
      return;
    }

    if (quantity > currentProduct.stock) {
      alert(`Solo hay ${currentProduct.stock} piezas disponibles en inventario.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmSale({
        product_id: currentProduct.id,
        product_title: currentProduct.title,
        product_sku: currentProduct.sku,
        quantity,
        unit_cost: unitCost,
        unit_sale_price: unitSalePrice,
        payment_method: paymentMethod,
        customer_name: customerName,
        notes,
      });

      // Efecto confetti para celebrar la venta cerrada
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#E8B4B8", "#25D366", "#2C2A29"],
        });
      } catch {}

      onClose();
    } catch (err) {
      console.error("Error registrando venta:", err);
      alert("Error al registrar y cobrar la venta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EFE6DF] my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F5EFEB] flex items-center justify-between bg-[#FAF7F2]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#2C2A29]">
                Cobrar Pedido WhatsApp / POS
              </h2>
              <p className="text-xs text-[#5A5653]">
                Convierte un chat de WhatsApp en venta cerrada con impacto en stock y finanzas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A5653] hover:text-[#2C2A29] hover:bg-[#F5EFEB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* Selector de Producto */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#2C2A29]">
              Seleccionar Prenda / Joya Vendida
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomPrice("");
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECEBF] text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#967056]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                  {p.title} (Ref: {p.sku}) — Stock: {p.stock} — {formatCurrency(p.discount_price || p.sale_price)}
                  {p.stock <= 0 ? " (AGOTADO)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Info del producto seleccionado */}
          {currentProduct && (
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DECEBF] flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-[#2C2A29]">{currentProduct.title}</p>
                <p className="text-[#5A5653]">
                  Talla: {currentProduct.size || "Única"} • Costo Adquisición (CMV):{" "}
                  <strong>{formatCurrency(currentProduct.cost_price)}</strong>
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`px-2 py-0.5 rounded-full font-bold ${
                    currentProduct.stock > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  Stock: {currentProduct.stock} disponibles
                </span>
              </div>
            </div>
          )}

          {/* Cantidad & Precio Acordado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">Cantidad</label>
              <input
                type="number"
                min="1"
                max={currentProduct?.stock || 99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">
                Precio Cobrado por Unidad
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5A5653]">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={customPrice !== "" ? customPrice : (currentProduct?.discount_price || currentProduct?.sale_price || "")}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Precio acordado"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#DECEBF] text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#2C2A29]">Método de Cobro</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Transferencia", "Efectivo", "Tarjeta"] as PaymentMethod[]).map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#2C2A29] text-white border-[#2C2A29] shadow-sm"
                        : "bg-white text-[#5A5653] border-[#DECEBF] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    {method === "Transferencia" && <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    {method === "Efectivo" && <Banknote className="w-3.5 h-3.5 text-emerald-500" />}
                    {method === "Tarjeta" && <CreditCard className="w-3.5 h-3.5 text-blue-500" />}
                    <span>{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Datos del Cliente y Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">
                Nombre de la Clienta (Opcional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej. Valeria M. (WhatsApp)"
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">Notas de entrega</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Enviar por Uber flash..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-xs"
              />
            </div>
          </div>

          {/* RESUMEN CONTABLE EN VIVO (P&L PREVIEW) */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DECEBF] space-y-2">
            <div className="flex justify-between text-xs text-[#5A5653]">
              <span>Ingreso Bruto de Venta:</span>
              <strong className="text-sm text-[#2C2A29]">{formatCurrency(totalAmount)}</strong>
            </div>
            <div className="flex justify-between text-xs text-[#5A5653]">
              <span>(-) Costo de Mercancía Vendida (CMV):</span>
              <span className="text-[#A8535D] font-medium">-{formatCurrency(totalCost)}</span>
            </div>
            <div className="pt-2 border-t border-[#DECEBF] flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#2C2A29]">
                (=) Ganancia Neta Inmediata:
              </span>
              <div className="text-right">
                <span className="text-base font-serif font-bold text-emerald-700">
                  +{formatCurrency(netProfit)}
                </span>
                <span className="text-[10px] text-emerald-600 block">
                  (Margen: {marginPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Botón de Confirmar y Cobrar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !currentProduct || currentProduct.stock <= 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Check className="w-5 h-5 fill-white" />
              <span>Confirmar y Cobrar ({formatCurrency(totalAmount)})</span>
            </button>
            <p className="text-[11px] text-center text-[#967056] mt-2 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#EE2F74] shrink-0" />
              <span>Al confirmar, el stock se descuenta automáticamente y si llega a 0 se oculta del catálogo.</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
