"use client";

import { Search, Sparkles, Filter, Gem, Shirt, RefreshCw, Percent, SlidersHorizontal, BookmarkCheck } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalProductsCount: number;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  searchTerm,
  onSearchChange,
  selectedCondition,
  onSelectCondition,
  sortBy,
  onSortChange,
  totalProductsCount,
}: CategoryFilterProps) {
  const categories = [
    { id: "todos", label: "Todo el Catálogo", icon: Sparkles },
    { id: "joyeria", label: "Cadenitas & Joyería", icon: Gem },
    { id: "ropa", label: "Ropa de Marca", icon: Shirt },
    { id: "preloved", label: "Pre-Loved / Segunda Mano", icon: RefreshCw, badge: "Exclusivo" },
    { id: "outlet", label: "Zona Outlet & Rebajas", icon: Percent, badge: "Ofertas" },
  ];

  return (
    <div className="space-y-5 bg-white rounded-3xl p-4 sm:p-6 border border-[#FCE7F3] shadow-soft">
      {/* Search Bar & Sort Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#EE2F74] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, SKU, color o estilo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#FCE7F3] focus:outline-none focus:ring-2 focus:ring-[#EE2F74]/30 focus:border-[#EE2F74] text-xs sm:text-sm bg-[#FFF1F5]/40 placeholder:text-[#A1A1AA] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71717A] hover:text-[#EE2F74] px-2 py-0.5 rounded-lg bg-white border border-[#FCE7F3]"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Condition & Sort Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Condición toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-[#FFF1F5]/50 border border-[#FCE7F3] text-xs">
            <button
              onClick={() => onSelectCondition("todos")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCondition === "todos"
                  ? "bg-white text-[#EE2F74] shadow-sm"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => onSelectCondition("Nuevo")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCondition === "Nuevo"
                  ? "bg-white text-[#18181B] shadow-sm"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              Nuevos
            </button>
            <button
              onClick={() => onSelectCondition("Pre-loved")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCondition === "Pre-loved"
                  ? "bg-[#FFE4EC] text-[#BE185D] shadow-sm"
                  : "text-[#71717A] hover:text-[#18181B]"
              }`}
            >
              Pre-Loved
            </button>
          </div>

          {/* Ordenar selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-[#FFF1F5]/50 border border-[#FCE7F3] rounded-2xl px-3.5 py-2 pr-8 text-xs font-semibold text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#EE2F74] cursor-pointer"
            >
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#EE2F74] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] text-white border-transparent shadow-md shadow-[#EE2F74]/20"
                  : "bg-white text-[#52525B] border-[#FCE7F3] hover:border-[#FBCFE8] hover:bg-[#FFF1F5]/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#EE2F74]"}`} />
              <span>{cat.label}</span>
              {cat.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#FFE4EC] text-[#BE185D]"
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Meta Counter & Layaway reminder */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#71717A] pt-2 border-t border-[#FCE7F3]">
        <span className="font-medium">
          Mostrando <strong className="text-[#EE2F74]">{totalProductsCount}</strong> piezas exclusivas disponibles
        </span>
        <span className="text-[11px] font-bold text-[#BE185D] flex items-center gap-1">
          <BookmarkCheck className="w-3.5 h-3.5 text-[#EE2F74]" />
          <span>Apartado disponible con 30%</span>
        </span>
      </div>
    </div>
  );
}
