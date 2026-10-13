import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  const symbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  return `${symbol}${Number(amount || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Genera el enlace oficial a WhatsApp con el mensaje pre-cargado
 * según las especificaciones de alta conversión requeridas:
 * "¡Hola! Me encantó este producto: [Nombre] (Ref: [SKU], Talla: [Talla], Precio: $[Precio]). ¿Sigue disponible para apartarlo?"
 */
export function buildWhatsAppOrderUrl(params: {
  phone?: string;
  title: string;
  sku?: string;
  size?: string;
  price: number;
}): string {
  const phone =
    params.phone ||
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE ||
    "525612894359";

  const cleanPhone = phone.replace(/\D/g, "");
  const priceFormatted = formatCurrency(params.price);
  const sizeText = params.size ? params.size : "Única";
  const skuText = params.sku ? params.sku : "N/A";

  const message = `¡Hola! Me encantó este producto: ${params.title} (Ref: ${skuText}, Talla: ${sizeText}, Precio: ${priceFormatted}). ¿Sigue disponible para apartarlo?`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function formatPhoneNumber(phone?: string): string {
  const raw = phone || process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
  const clean = raw.replace(/\D/g, "").replace(/^521?/, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 6)} ${clean.slice(6)}`;
  }
  return clean || "56 1289 4359";
}

export function generateSKU(category: string, title: string): string {
  const catPrefix = category.slice(0, 3).toUpperCase();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${catPrefix}-${randomSuffix}`;
}
