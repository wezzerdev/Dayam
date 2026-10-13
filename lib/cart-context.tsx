"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "./types";
import { formatCurrency } from "./utils";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
  layawayPercent: number;
  layawayDeposit: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  getWhatsAppCheckoutUrl: (isLayaway?: boolean) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "dayam_boutique_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar carrito persistente de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {}
    setIsInitialized(true);
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, isInitialized]);

  const addToCart = (product: Product, quantity: number = 1, size?: string, color?: string) => {
    const itemSize = size || product.size || "Única";
    const itemColor = color || product.color || "";

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedSize === itemSize
      );

      if (existingIdx > -1) {
        const next = [...prev];
        const newQty = Math.min(
          next[existingIdx].quantity + quantity,
          product.stock || 99
        );
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: newQty,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(quantity, product.stock || 99),
            selectedSize: itemSize,
            selectedColor: itemColor,
          },
        ];
      }
    });

    // Abrir automáticamente el carrito para que la clienta vea lo que agregó
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size?: string) => {
    setItems((prev) =>
      prev.filter((it) => !(it.product.id === productId && (size ? it.selectedSize === size : true)))
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setItems((prev) =>
      prev.map((it) => {
        if (it.product.id === productId && (size ? it.selectedSize === size : true)) {
          const maxStock = it.product.stock || 99;
          return {
            ...it,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalItems = items.reduce((acc, it) => acc + it.quantity, 0);

  const subtotal = items.reduce((acc, it) => {
    const price = it.product.discount_price || it.product.sale_price;
    return acc + price * it.quantity;
  }, 0);

  const layawayPercent = 30; // 30% de anticipo para sistema de apartado
  const layawayDeposit = subtotal * (layawayPercent / 100);

  /**
   * Genera el mensaje oficial consolidado para enviar por WhatsApp
   */
  const getWhatsAppCheckoutUrl = (isLayaway: boolean = false): string => {
    const storePhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
    const cleanPhone = storePhone.replace(/\D/g, "");

    if (items.length === 0) {
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent("¡Hola Dayam Boutique! Me gustaría pedir informes.")}`;
    }

    const greeting = isLayaway
      ? "¡Hola Dayam Boutique! Me gustaría solicitar el *SISTEMA DE APARTADO (30% de anticipo)* para las siguientes prendas de mi carrito:"
      : "¡Hola Dayam Boutique! Deseo realizar el pedido de los productos de mi carrito:";

    const productLines = items
      .map((it, idx) => {
        const price = it.product.discount_price || it.product.sale_price;
        const lineTotal = price * it.quantity;
        return `${idx + 1}. *${it.product.title}*
   • Cantidad: ${it.quantity}
   • Talla: ${it.selectedSize || "Única"}
   • Ref/SKU: ${it.product.sku || "N/A"}
   • Precio: ${formatCurrency(lineTotal)}`;
      })
      .join("\n\n");

    const totalText = `\n------------------------------\n• Total de prendas: ${totalItems}\n• Total del pedido: ${formatCurrency(subtotal)}`;

    const layawayText = isLayaway
      ? `\n\n*SISTEMA DE APARTADO:*
   • Anticipo a pagar hoy (30%): *${formatCurrency(layawayDeposit)}*
   • Restante a liquidar (70%): *${formatCurrency(subtotal - layawayDeposit)}* (plazo hasta 20 días)`
      : `\n• Opción de Apartado: Puedo apartar con el 30% (${formatCurrency(layawayDeposit)})`;

    const clientInfo = customerName.trim()
      ? `\n\n• Clienta: ${customerName.trim()}`
      : "";

    const closing = "\n\n¿Me comparten por favor los datos de transferencia para confirmar mi pedido?";

    const fullMessage = `${greeting}\n\n${productLines}${totalText}${layawayText}${clientInfo}${closing}`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullMessage)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        totalItems,
        subtotal,
        layawayPercent,
        layawayDeposit,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        getWhatsAppCheckoutUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}
