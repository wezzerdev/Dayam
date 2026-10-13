"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Plus, 
  Trash2, 
  Calendar, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Package,
  Sparkles,
  RefreshCw,
  Wallet,
  Building2,
  CheckCircle2
} from "lucide-react";
import { FinancialSummary, Expense } from "@/lib/types";
import { getFinancialSummary, getExpenses, addExpense, deleteExpense } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseModal } from "@/components/admin/expense-modal";

export default function AdminFinanzasPage() {
  const [period, setPeriod] = useState<"all" | "today" | "month" | "year">("month");
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const loadData = async (selectedPeriod: "all" | "today" | "month" | "year" = period) => {
    setLoading(true);
    const [sum, exps] = await Promise.all([
      getFinancialSummary(selectedPeriod),
      getExpenses(),
    ]);
    setSummary(sum);
    setExpenses(exps);
    setLoading(false);
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const handleAddExpense = async (params: any) => {
    await addExpense(params);
    await loadData(period);
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm("¿Estás segura de eliminar este gasto operativo?")) {
      await deleteExpense(id);
      await loadData(period);
    }
  };

  const periodLabels = {
    today: "Hoy",
    month: "Este Mes",
    year: "Este Año",
    all: "Histórico Total",
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 space-y-6">
      {/* Top Header & Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B]">
            Finanzas & Balance General
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Estado de Resultados (P&L) y Balance de Activos en tiempo real.
          </p>
        </div>

        {/* Period Selector & New Expense (Desktop) */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center p-1 rounded-2xl bg-white border border-[#FCE7F3] text-xs font-bold overflow-x-auto w-full sm:w-auto">
            {(["today", "month", "year", "all"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl transition-all ${
                  period === p
                    ? "bg-[#EE2F74] text-white shadow-sm font-bold"
                    : "text-[#71717A] hover:text-[#18181B]"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="hidden sm:flex px-4 py-2 rounded-2xl bg-[#18181B] hover:bg-black text-white text-xs font-bold items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#EE2F74]" />
            <span>+ Registrar Gasto</span>
          </button>
        </div>
      </div>

      {loading || !summary ? (
        <div className="py-20 text-center text-[#EE2F74] flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-xs font-bold text-[#18181B]">Calculando libros contables...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TARJETAS EJECUTIVAS CLAVE - Responsive Móvil */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Utilidad Neta */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#EE2F74] uppercase tracking-wider block">
                Utilidad Neta ({periodLabels[period]})
              </span>
              <p className={`font-serif text-xl sm:text-3xl font-extrabold mt-1 ${
                summary.net_profit >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}>
                {summary.net_profit >= 0 ? "+" : ""}{formatCurrency(summary.net_profit)}
              </p>
              <span className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold block mt-0.5">
                Margen: {summary.profit_margin_pct.toFixed(1)}%
              </span>
            </div>

            {/* Margen Promedio */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
                Margen Comercial
              </span>
              <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
                {summary.profit_margin_pct.toFixed(1)}%
              </p>
              <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
                Sobre ventas
              </span>
            </div>

            {/* Activo Circulante Total */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#EE2F74] uppercase tracking-wider block">
                Activo Circulante
              </span>
              <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
                {formatCurrency(summary.total_current_assets)}
              </p>
              <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
                Caja + Stock a costo
              </span>
            </div>

            {/* Unidades & Rotación */}
            <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#71717A] uppercase tracking-wider block">
                Prendas en Stock
              </span>
              <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
                {summary.total_items_in_stock} <span className="text-xs font-normal text-[#71717A]">pzs</span>
              </p>
              <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
                {summary.total_items_sold} vendidas este periodo
              </span>
            </div>
          </div>

          {/* COLUMNAS: ESTADO DE RESULTADOS & BALANCE GENERAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1. ESTADO DE RESULTADOS (P&L) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-[#FCE7F3] shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#FFF1F5] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF1F5] text-[#EE2F74] flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#18181B]">
                      Estado de Resultados (P&L)
                    </h2>
                    <p className="text-[11px] text-[#71717A]">
                      Evaluando: <strong className="text-[#EE2F74]">{periodLabels[period]}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Renglones Contables P&L */}
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF1F5]/40 border border-[#FCE7F3]">
                  <div>
                    <span className="font-bold text-[#18181B] block">(+) Ingresos por Ventas</span>
                    <span className="text-[10px] text-[#71717A]">Total cobrado a clientas</span>
                  </div>
                  <strong className="text-sm sm:text-base font-serif font-bold text-[#18181B]">
                    {formatCurrency(summary.gross_sales)}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div>
                    <span className="font-bold text-rose-900 block">(-) Costo Mercancías Vendidas (CMV)</span>
                    <span className="text-[10px] text-rose-600">Lo que costó adquirir las prendas</span>
                  </div>
                  <strong className="text-sm sm:text-base font-serif font-bold text-rose-700">
                    -{formatCurrency(summary.cost_of_goods_sold)}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#FCE7F3]">
                  <div>
                    <span className="font-bold text-[#18181B] block">(=) Utilidad Bruta</span>
                    <span className="text-[10px] text-[#71717A]">Margen antes de gastos</span>
                  </div>
                  <strong className="text-sm sm:text-base font-serif font-bold text-[#18181B]">
                    {formatCurrency(summary.gross_profit)}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
                  <div>
                    <span className="font-bold text-rose-900 block">(-) Gastos Operativos</span>
                    <span className="text-[10px] text-rose-600">Envíos, empaques, pauta y extras</span>
                  </div>
                  <strong className="text-sm sm:text-base font-serif font-bold text-rose-700">
                    -{formatCurrency(summary.operating_expenses)}
                  </strong>
                </div>

                {/* Utilidad Neta Destacada */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#18181B] via-[#24121A] to-[#18181B] text-white shadow-md">
                  <div>
                    <span className="font-bold text-sm text-white block">(=) Utilidad Neta</span>
                    <span className="text-[10px] text-[#FBCFE8]">Ganancia libre de la boutique</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-lg sm:text-2xl font-serif font-extrabold text-emerald-400 block">
                      {formatCurrency(summary.net_profit)}
                    </strong>
                    <span className="text-[10px] text-amber-300 font-bold">
                      {summary.profit_margin_pct.toFixed(1)}% margen final
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BALANCE GENERAL */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-6 border border-[#FCE7F3] shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#FFF1F5] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF1F5] text-[#EE2F74] flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#18181B]">
                      Balance General
                    </h2>
                    <p className="text-[11px] text-[#71717A]">
                      Valoración de activos circulantes
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-[#FFF1F5]/40 border border-[#FCE7F3] space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#EE2F74]">
                    Activo Circulante
                  </h4>

                  <div className="flex items-center justify-between py-1 border-b border-[#FCE7F3]">
                    <span className="text-[#71717A]">Efectivo en Caja / Banco:</span>
                    <strong className="text-sm font-bold text-[#18181B]">
                      {formatCurrency(summary.cash_available)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-[#FCE7F3]">
                    <div>
                      <span className="text-[#71717A] block">Inventario Físico (a costo):</span>
                      <span className="text-[10px] text-[#A1A1AA]">{summary.total_items_in_stock} piezas</span>
                    </div>
                    <strong className="text-sm font-bold text-[#18181B]">
                      {formatCurrency(summary.inventory_cost_value)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-bold">
                    <span className="text-[#18181B]">Total Activo Circulante:</span>
                    <strong className="text-base font-serif font-extrabold text-emerald-700">
                      {formatCurrency(summary.total_current_assets)}
                    </strong>
                  </div>
                </div>

                {/* Potencial Comercial */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#FCE7F3] space-y-1 text-xs">
                  <div className="flex justify-between text-[#71717A]">
                    <span>Valor de Stock a Venta:</span>
                    <strong className="text-[#18181B]">{formatCurrency(summary.inventory_retail_value)}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Plusvalía Potencial en Almacén:</span>
                    <span>+{formatCurrency(summary.inventory_retail_value - summary.inventory_cost_value)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. GASTOS OPERATIVOS EN TARJETAS TÁCTILES MOBILE-FIRST */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#FCE7F3] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#18181B]">
                  Gastos Operativos Registrados
                </h3>
                <p className="text-xs text-[#71717A]">
                  Envíos, empaques, publicidad en redes sociales y servicios
                </p>
              </div>

              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-[#FFF1F5] hover:bg-[#FFE4EC] text-xs font-bold text-[#EE2F74] items-center gap-1.5 border border-[#FCE7F3]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Gasto</span>
              </button>
            </div>

            {expenses.length === 0 ? (
              <p className="text-xs text-[#71717A] py-6 text-center">
                No hay gastos registrados en este periodo.
              </p>
            ) : (
              /* GRID DE TARJETAS DE GASTOS TÁCTILES */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-2xl bg-[#FFF1F5]/30 border border-[#FCE7F3] flex items-center justify-between hover:bg-[#FFF1F5]/60 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-white border border-[#FBCFE8] text-[#BE185D]">
                          {exp.category}
                        </span>
                        <span className="text-[10px] text-[#A1A1AA] font-medium">{formatDate(exp.date)}</span>
                      </div>
                      <h4 className="font-bold text-xs text-[#18181B] line-clamp-1">{exp.concept}</h4>
                      {exp.notes && (
                        <p className="text-[10px] text-[#71717A] italic line-clamp-1">{exp.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-serif font-extrabold text-sm text-rose-600">
                        -{formatCurrency(exp.amount)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE PRINCIPAL (FAB) PARA CELULAR: REGISTRAR GASTO */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden">
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="h-14 px-5 rounded-full bg-[#18181B] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
          aria-label="Registrar Gasto Operativo"
        >
          <Plus className="w-5 h-5 text-[#EE2F74]" />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Modal de Gastos */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}
