"use client";

import { useState } from "react";
import { X, Check, DollarSign, Receipt, Sparkles } from "lucide-react";
import { ExpenseCategory } from "@/lib/types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (params: {
    concept: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes?: string;
  }) => Promise<void>;
}

export function ExpenseModal({ isOpen, onClose, onAddExpense }: ExpenseModalProps) {
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Empaques");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept || !amount || Number(amount) <= 0) {
      alert("Por favor indica el concepto y un monto válido");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddExpense({
        concept,
        amount: Number(amount),
        category,
        date,
        notes,
      });
      onClose();
    } catch (err) {
      console.error("Error guardando gasto:", err);
      alert("Error al registrar el gasto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EFE6DF] my-8">
        <div className="px-6 py-4 border-b border-[#F5EFEB] flex items-center justify-between bg-[#FAF7F2]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C47D85]/15 text-[#A8535D] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#2C2A29]">
                Registrar Gasto Operativo
              </h2>
              <p className="text-xs text-[#5A5653]">
                Impacta el Estado de Resultados (P&L) y Utilidad Neta
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2A29]">Concepto del Gasto *</label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Bolsas ecológicas, pauta Instagram..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECEBF] text-sm focus:outline-none focus:ring-1 focus:ring-[#967056]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">Monto Gastado *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5A5653]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250.00"
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#DECEBF] text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl border border-[#DECEBF] text-xs bg-white"
              >
                <option value="Empaques">Empaques y Presentación</option>
                <option value="Envíos">Envíos y Mensajería</option>
                <option value="Publicidad">Publicidad y Marketing</option>
                <option value="Servicios">Servicios y Software</option>
                <option value="Otros">Otros Gastos</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2A29]">Fecha del Gasto</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2A29]">Notas adicionales</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Proveedor o detalle..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-2xl bg-[#2C2A29] hover:bg-[#4D3628] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>Registrar en Finanzas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
