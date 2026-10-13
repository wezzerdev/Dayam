import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileBottomBar } from "@/components/mobile-bottom-bar";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Boutique & Accesorios Dayam | Moda Femenina, Joyería & Sistema de Apartado",
  description:
    "Catálogo exclusivo de moda femenina, joyería fina en chapa de oro, selección curated de ropa Pre-Loved y zona Outlet. Carrito de compras, sistema de apartado y pedidos directos por WhatsApp.",
  keywords: [
    "boutique femenina",
    "joyeria fina",
    "cadenitas chapa de oro",
    "ropa de marca",
    "sistema de apartado",
    "ropa pre-loved",
    "segunda mano premium",
    "outlet moda",
    "compras whatsapp",
  ],
  openGraph: {
    title: "Boutique & Accesorios Dayam | Moda & Estilo Femenino",
    description: "Moda femenina exclusiva, joyería fina y selección Pre-Loved. Carrito interactivo y sistema de apartado.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jakarta.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-[#18181B] antialiased flex flex-col pb-16 md:pb-0">
        <CartProvider>
          {children}
          <CartDrawer />
          <MobileBottomBar />
        </CartProvider>
      </body>
    </html>
  );
}
