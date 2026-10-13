import { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  title: "Panel Administrativo | Boutique & Accesorios Dayam",
  description: "Gestión de inventario, estudio fotográfico con fondo blanco, POS y estados financieros en tiempo real.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FFF5F8]/30 text-[#18181B] flex flex-col">
      <AdminNav />
      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
