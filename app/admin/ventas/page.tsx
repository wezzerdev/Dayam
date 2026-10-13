"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingCart, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  Calendar,
  User,
  Search,
  RefreshCw,
  MessageCircle,
  Package,
  LayoutGrid,
  List
} from "lucide-react";
import { Sale, Product } from "@/lib/types";
import { getSales, getProducts, registerSale } from "@/lib/store";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { SalesRegisterModal } from "@/components/admin/sales-register-modal";

export default function AdminVentasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMethod, setFilterMethod] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const loadData = async () => {
    setLoading(true);
    const [salesData, productsData] = await Promise.all([
      getSales(),
      getProducts(false),
    ]);
    setSales(salesData);
    setProducts(productsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmSale = async (params: any) => {
    await registerSale(params);
    await loadData();
  };

  // Métricas de ventas
  const totalGrossRevenue = sales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const totalCostSold = sales.reduce((acc, s) => acc + Number(s.unit_cost || 0) * Number(s.quantity || 1), 0);
  const totalNetProfit = sales.reduce((acc, s) => acc + Number(s.profit || 0), 0);
  const totalItemsSold = sales.reduce((acc, s) => acc + Number(s.quantity || 1), 0);

  const filteredSales = sales.filter((s) => {
    const matchesMethod = filterMethod === "all" || s.payment_method === filterMethod;
    const matchesSearch =
      s.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.product_sku && s.product_sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesMethod && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B]">
            Registro de Ventas & POS
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Convierte chats de WhatsApp en ventas cerradas con cálculo contable instantáneo.
          </p>
        </div>

        {/* Action button desktop */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="hidden sm:flex px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>+ Cobrar Pedido de WhatsApp</span>
        </button>
      </div>

      {/* KPI Cards de Ventas - Compacto y táctil */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
            Ingresos Cobrados
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
            {formatCurrency(totalGrossRevenue)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
            Total en caja y cuentas
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            Costo Mercancía (CMV)
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-rose-700 mt-1">
            {formatCurrency(totalCostSold)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
            Costo adquisición
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Ganancia Neta
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            +{formatCurrency(totalNetProfit)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 mt-0.5 block">
            Margen: {totalGrossRevenue > 0 ? ((totalNetProfit / totalGrossRevenue) * 100).toFixed(1) : 0}%
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#EE2F74] uppercase tracking-wider block">
            Prendas Vendidas
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
            {totalItemsSold} <span className="text-xs font-sans font-normal text-[#71717A]">pzs</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
            En {sales.length} transacciones
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#FCE7F3] shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#EE2F74] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por prenda, clienta o SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#FCE7F3] text-xs bg-[#FFF1F5]/40 focus:outline-none focus:ring-1 focus:ring-[#EE2F74]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="flex-1 sm:flex-none bg-[#FFF1F5]/40 border border-[#FCE7F3] rounded-xl px-3 py-2 text-xs font-bold text-[#18181B] focus:outline-none"
          >
            <option value="all">Todos los Métodos</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>

          {/* Switcher Cards vs Table (pantallas grandes) */}
          <div className="hidden md:flex items-center gap-1 bg-[#FFF1F5] p-1 rounded-xl border border-[#FCE7F3]">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "cards" ? "bg-white text-[#EE2F74] shadow-sm" : "text-[#71717A]"
              }`}
              title="Vista de Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-white text-[#EE2F74] shadow-sm" : "text-[#71717A]"
              }`}
              title="Vista de Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: VISTA DE TARJETAS TÁCTILES */}
      {loading ? (
        <div className="py-20 text-center text-[#EE2F74] flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-xs font-bold text-[#18181B]">Cargando transacciones...</span>
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#FCE7F3] p-6 space-y-3">
          <ShoppingCart className="w-10 h-10 text-[#FBCFE8] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#18181B]">Sin ventas con estos filtros</h3>
          <p className="text-xs text-[#71717A]">Haz clic en "+ Cobrar Pedido" para registrar una venta.</p>
        </div>
      ) : viewMode === "cards" ? (
        /* TARJETAS TÁCTILES MOBILE-FIRST (ESTILO TICKET GLAM) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="bg-white rounded-3xl p-4 border border-[#FCE7F3] shadow-soft hover:shadow-card transition-all space-y-3 flex flex-col justify-between"
            >
              {/* Header de Venta */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FFF1F5]">
                <div className="flex items-center gap-1.5 text-[#71717A]">
                  <Calendar className="w-3.5 h-3.5 text-[#EE2F74]" />
                  <span className="font-medium">{formatDateTime(sale.created_at)}</span>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF1F5] text-[#18181B] border border-[#FCE7F3]">
                  {sale.payment_method === "Transferencia" && <Sparkles className="w-3 h-3 text-amber-500" />}
                  {sale.payment_method === "Efectivo" && <Banknote className="w-3 h-3 text-emerald-600" />}
                  {sale.payment_method === "Tarjeta" && <CreditCard className="w-3 h-3 text-blue-600" />}
                  <span>{sale.payment_method}</span>
                </span>
              </div>

              {/* Detalle de la Prenda */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-bold text-sm text-[#18181B] line-clamp-1">
                    {sale.product_title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-lg bg-[#FFE4EC] text-[#BE185D] text-xs font-extrabold shrink-0">
                    x{sale.quantity}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#EE2F74] block">
                  Ref: {sale.product_sku || "N/A"}
                </span>

                {/* Clienta */}
                <div className="flex items-center gap-1.5 pt-1 text-xs text-[#71717A]">
                  <User className="w-3.5 h-3.5 text-[#EE2F74]" />
                  <span className="font-medium text-[#18181B]">
                    {sale.customer_name || "Clienta Mostrador"}
                  </span>
                </div>
                {sale.notes && (
                  <p className="text-[11px] text-[#A1A1AA] italic line-clamp-1">
                    {sale.notes}
                  </p>
                )}
              </div>

              {/* Desglose Financiero */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF1F5]/60 to-white border border-[#FCE7F3] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#71717A]">
                  <span>Total Cobrado:</span>
                  <strong className="text-sm text-[#18181B] font-bold">{formatCurrency(sale.total_amount)}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-rose-600">
                  <span>(-) Costo de Mercancía (CMV):</span>
                  <span>-{formatCurrency(sale.unit_cost * sale.quantity)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1.5 border-t border-[#FCE7F3]">
                  <span className="font-bold text-emerald-800">(=) Ganancia Neta:</span>
                  <div className="text-right">
                    <strong className="text-base font-serif font-extrabold text-emerald-700">
                      +{formatCurrency(sale.profit)}
                    </strong>
                    <span className="text-[10px] text-emerald-600 block">
                      ({(sale.total_amount > 0 ? (sale.profit / sale.total_amount) * 100 : 0).toFixed(0)}% margen)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* VISTA DE TABLA TRADICIONAL */
        <div className="bg-white rounded-3xl border border-[#FCE7F3] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF1F5] text-[#EE2F74] font-bold border-b border-[#FCE7F3]">
                <tr>
                  <th className="py-3.5 px-4">Fecha & Hora</th>
                  <th className="py-3.5 px-4">Prenda / Ref</th>
                  <th className="py-3.5 px-4">Clienta / Notas</th>
                  <th className="py-3.5 px-4">Método</th>
                  <th className="py-3.5 px-4">Cant.</th>
                  <th className="py-3.5 px-4">Total Cobrado</th>
                  <th className="py-3.5 px-4">CMV (Costo)</th>
                  <th className="py-3.5 px-4 text-right">Ganancia Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF1F5]">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#FFF1F5]/40 transition-colors">
                    <td className="py-3 px-4 text-[#71717A] whitespace-nowrap">{formatDateTime(sale.created_at)}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-sm text-[#18181B] line-clamp-1">{sale.product_title}</p>
                      <span className="text-[11px] text-[#EE2F74] font-mono">Ref: {sale.product_sku || "N/A"}</span>
                    </td>
                    <td className="py-3 px-4 text-[#71717A]">
                      <span className="font-semibold text-[#18181B]">{sale.customer_name || "Mostrador"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F5] text-[#18181B] border border-[#FCE7F3]">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#18181B]">{sale.quantity}</td>
                    <td className="py-3 px-4 font-bold text-sm text-[#18181B]">{formatCurrency(sale.total_amount)}</td>
                    <td className="py-3 px-4 text-rose-600">-{formatCurrency(sale.unit_cost * sale.quantity)}</td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-sm text-emerald-700">
                      +{formatCurrency(sale.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE PRINCIPAL (FAB) PARA CELULAR: COBRAR PEDIDO WHATSAPP */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden">
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-5 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/40 active:scale-95 transition-transform"
          aria-label="Cobrar Pedido WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span>Cobrar Pedido</span>
        </button>
      </div>

      {/* Modal de Cobro */}
      <SalesRegisterModal
        isOpen={isModalOpen}
        products={products}
        onClose={() => setIsModalOpen(false)}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  );
}
