"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Package, 
  Plus, 
  Wand2, 
  Search, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Layers,
  ShoppingBag,
  RefreshCw,
  Camera,
  LayoutGrid,
  List,
  Eye,
  EyeOff
} from "lucide-react";
import { Product } from "@/lib/types";
import { getProducts, saveProduct, deleteProduct, registerSale } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { ProductFormModal } from "@/components/admin/product-form-modal";
import { SalesRegisterModal } from "@/components/admin/sales-register-modal";
import { ImageStudio } from "@/components/admin/image-studio";

export default function AdminInventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [saleProductTarget, setSaleProductTarget] = useState<Product | null>(null);

  const [showStandaloneStudio, setShowStandaloneStudio] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getProducts(false); // all products including inactive & 0 stock
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProduct = async (productData: Partial<Product> & { title: string; sale_price: number }) => {
    await saveProduct(productData);
    await loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás segura de eliminar esta prenda del inventario?")) {
      await deleteProduct(id);
      await loadData();
    }
  };

  const handleToggleActive = async (product: Product) => {
    await saveProduct({
      id: product.id,
      title: product.title,
      sale_price: product.sale_price,
      is_active: !product.is_active,
    });
    await loadData();
  };

  const handleOpenSaleModal = (product: Product) => {
    setSaleProductTarget(product);
    setIsSalesModalOpen(true);
  };

  const handleConfirmSale = async (params: any) => {
    await registerSale(params);
    await loadData();
  };

  // Métricas rápidas de inventario
  const totalItemsInStock = products.reduce((acc, p) => acc + Math.max(0, p.stock), 0);
  const totalCostValue = products.reduce((acc, p) => acc + Number(p.cost_price || 0) * Math.max(0, p.stock), 0);
  const totalRetailValue = products.reduce((acc, p) => acc + Number(p.sale_price || 0) * Math.max(0, p.stock), 0);
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.color && p.color.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B]">
            Inventario & Fotografías
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Carga rápida con auto-limpieza a fondo blanco y control de costos CMV.
          </p>
        </div>

        {/* Action Buttons Desktop */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={() => setShowStandaloneStudio(!showStandaloneStudio)}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#FCE7F3] text-[#18181B] hover:bg-[#FFF1F5] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Camera className="w-4 h-4 text-[#EE2F74]" />
            <span>Estudio Fotográfico</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#EE2F74]/20 transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Nueva Prenda</span>
          </button>
        </div>
      </div>

      {/* Estudio Fotográfico Flotante si está abierto */}
      {showStandaloneStudio && (
        <div className="animate-slide-up">
          <ImageStudio
            onImageReady={(url) => {
              setShowStandaloneStudio(false);
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            onCancel={() => setShowStandaloneStudio(false)}
          />
        </div>
      )}

      {/* KPI Cards de Inventario - Compacto y táctil en móvil */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#EE2F74] uppercase tracking-wider block">
            Prendas en Stock
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
            {totalItemsInStock} <span className="text-xs font-sans font-normal text-[#71717A]">piezas</span>
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
            En {products.length} modelos
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#EE2F74] uppercase tracking-wider block">
            Inversión (CMV)
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-[#18181B] mt-1">
            {formatCurrency(totalCostValue)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
            Costo de compra
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Valor Venta
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
            {formatCurrency(totalRetailValue)}
          </p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 mt-0.5 block">
            Ganancia: +{formatCurrency(totalRetailValue - totalCostValue)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-[#FCE7F3] shadow-soft">
          <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            Agotadas
          </span>
          <p className="font-serif text-xl sm:text-3xl font-extrabold text-rose-700 mt-1">
            {outOfStockCount}
          </p>
          <span className="text-[10px] sm:text-[11px] text-[#71717A] mt-0.5 block">
            Ocultas del catálogo
          </span>
        </div>
      </div>

      {/* Filtros, Búsqueda y Switcher de Vista */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#FCE7F3] shadow-soft space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#EE2F74] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar prenda, SKU o color..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#FCE7F3] text-xs bg-[#FFF1F5]/40 focus:outline-none focus:ring-1 focus:ring-[#EE2F74]"
            />
          </div>

          {/* Switcher Cards vs Table (para pantallas grandes) */}
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

        {/* Category Filter Pills scrollables */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: "all", label: "Todos" },
            { id: "joyeria", label: "Joyería" },
            { id: "ropa", label: "Ropa" },
            { id: "preloved", label: "Pre-loved" },
            { id: "outlet", label: "Outlet" },
            { id: "accesorios", label: "Bolsos" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                categoryFilter === cat.id
                  ? "bg-[#EE2F74] text-white border-[#EE2F74] shadow-sm"
                  : "bg-white text-[#71717A] border-[#FCE7F3] hover:bg-[#FFF1F5]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: VISTA DE TARJETAS TÁCTILES MOBILE-FIRST */}
      {loading ? (
        <div className="py-20 text-center text-[#EE2F74] flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-xs font-bold text-[#18181B]">Cargando inventario...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#FCE7F3] p-6 space-y-3">
          <Package className="w-10 h-10 text-[#FBCFE8] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#18181B]">Sin prendas encontradas</h3>
          <p className="text-xs text-[#71717A]">Prueba con otro filtro o agrega un nuevo producto.</p>
        </div>
      ) : viewMode === "cards" ? (
        /* VISTA DE TARJETAS TÁCTILES (ÓPTIMA PARA MÓVIL Y TABLET) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredProducts.map((p) => {
            const image = p.images?.[0] || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80";
            const currentSalePrice = p.discount_price || p.sale_price;
            const unitProfit = currentSalePrice - p.cost_price;

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-3.5 sm:p-4 border border-[#FCE7F3] shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-3"
              >
                {/* Header de la Tarjeta */}
                <div className="flex gap-3">
                  {/* Imagen en fondo blanco puro */}
                  <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-white border border-[#FCE7F3] shrink-0 p-1">
                    <Image
                      src={image}
                      alt={p.title}
                      fill
                      sizes="100px"
                      className="object-contain"
                    />
                    {/* Badge de stock sobre la foto */}
                    <span
                      className={`absolute bottom-1 left-1 right-1 text-[9px] font-extrabold text-center rounded py-0.5 ${
                        p.stock > 2
                          ? "bg-emerald-600 text-white"
                          : p.stock > 0
                          ? "bg-amber-500 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {p.stock > 0 ? `${p.stock} pzs` : "Agotado"}
                    </span>
                  </div>

                  {/* Metadatos */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#EE2F74] bg-[#FFF1F5] px-1.5 py-0.2 rounded border border-[#FCE7F3]">
                        {p.sku || "S/SKU"}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                          p.condition === "Pre-loved"
                            ? "bg-[#FFE4EC] text-[#BE185D]"
                            : "bg-[#FFF1F5] text-[#18181B]"
                        }`}
                      >
                        {p.condition}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-sm text-[#18181B] line-clamp-2">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                      {p.size && (
                        <span>Talla: <strong className="text-[#18181B]">{p.size}</strong></span>
                      )}
                      {p.color && (
                        <span>• {p.color}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bloque Financiero: Costo CMV vs Venta y Margen */}
                <div className="p-2.5 rounded-2xl bg-[#FFF1F5]/50 border border-[#FCE7F3] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#71717A] block">Costo CMV</span>
                    <strong className="text-[#18181B] font-semibold">{formatCurrency(p.cost_price)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] block">Venta</span>
                    <strong className="text-[#EE2F74] font-bold">{formatCurrency(currentSalePrice)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] block">Ganancia</span>
                    <strong className="text-emerald-700 font-bold">+{formatCurrency(unitProfit)}</strong>
                  </div>
                </div>

                {/* Acciones Táctiles Mobile */}
                <div className="pt-1 flex items-center gap-2">
                  {/* Botón Principal: Cobrar Venta POS WhatsApp */}
                  <button
                    onClick={() => handleOpenSaleModal(p)}
                    disabled={p.stock <= 0}
                    className="flex-1 py-2.5 px-3 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 transition-all"
                  >
                    <DollarSign className="w-4 h-4 fill-white" />
                    <span>Cobrar Venta</span>
                  </button>

                  {/* Toggle Activo / Oculto */}
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`p-2.5 rounded-2xl border transition-colors ${
                      p.is_active && p.stock > 0
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}
                    title={p.is_active ? "Visible en catálogo" : "Oculto"}
                  >
                    {p.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setIsFormOpen(true);
                    }}
                    className="p-2.5 rounded-2xl bg-[#FFF1F5] border border-[#FCE7F3] text-[#18181B] hover:text-[#EE2F74] transition-colors"
                    title="Editar Prenda"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 hover:text-rose-800 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA DE TABLA TRADICIONAL PARA DESKTOP */
        <div className="bg-white rounded-3xl border border-[#FCE7F3] shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF1F5] text-[#EE2F74] font-bold border-b border-[#FCE7F3]">
                <tr>
                  <th className="py-3.5 px-4">Prenda / Foto</th>
                  <th className="py-3.5 px-4">Categoría & Estado</th>
                  <th className="py-3.5 px-4">Costo (CMV)</th>
                  <th className="py-3.5 px-4">Precio Venta</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Catálogo</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFF1F5]">
                {filteredProducts.map((p) => {
                  const image = p.images?.[0] || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80";
                  return (
                    <tr key={p.id} className="hover:bg-[#FFF1F5]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-white border border-[#FCE7F3] shrink-0">
                            <Image src={image} alt={p.title} fill sizes="60px" className="object-contain p-0.5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#18181B] line-clamp-1">{p.title}</p>
                            <span className="text-[11px] text-[#EE2F74] font-mono">Ref: {p.sku || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-[#18181B] font-semibold block">{p.category}</span>
                        <span className="text-[10px] text-[#71717A]">{p.condition}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#71717A]">{formatCurrency(p.cost_price)}</td>
                      <td className="py-3 px-4 font-bold text-[#18181B] text-sm">
                        {formatCurrency(p.discount_price || p.sale_price)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                          p.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {p.stock} pzs
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold ${p.is_active && p.stock > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {p.is_active && p.stock > 0 ? "Visible" : "Oculto"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenSaleModal(p)}
                            disabled={p.stock <= 0}
                            className="px-2.5 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm disabled:opacity-30"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Cobrar</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#71717A] hover:text-[#EE2F74]"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOTONES FLOTANTES TÁCTILES (FAB) PARA CELULAR */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden flex flex-col items-end gap-2.5">
        {/* FAB Cámara / Estudio */}
        <button
          onClick={() => setShowStandaloneStudio(!showStandaloneStudio)}
          className="w-12 h-12 rounded-full bg-white border border-[#FCE7F3] text-[#EE2F74] shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Abrir Estudio de Foto"
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* FAB Principal: + Nueva Prenda */}
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="h-14 px-5 rounded-full bg-gradient-to-r from-[#D9165C] via-[#EE2F74] to-[#F43F5E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#EE2F74]/35 active:scale-95 transition-transform"
          aria-label="Agregar Nueva Prenda"
        >
          <Plus className="w-5 h-5 text-white" />
          <span>Nueva Prenda</span>
        </button>
      </div>

      {/* Modal de Producto (Alta / Edición) */}
      <ProductFormModal
        isOpen={isFormOpen}
        product={editingProduct}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Modal de Cobro POS */}
      <SalesRegisterModal
        isOpen={isSalesModalOpen}
        products={products}
        preselectedProduct={saleProductTarget}
        onClose={() => setIsSalesModalOpen(false)}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  );
}
