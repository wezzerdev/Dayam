"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Plus, Wand2, Trash2, Sparkles, Check, RefreshCw } from "lucide-react";
import { Product, ProductCategory, ProductCondition } from "@/lib/types";
import { generateSKU } from "@/lib/utils";
import { ImageStudio } from "./image-studio";

interface ProductFormModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product> & { title: string; sale_price: number }) => Promise<void>;
}

export function ProductFormModal({ product, isOpen, onClose, onSave }: ProductFormModalProps) {
  const isEditing = Boolean(product);

  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState<ProductCategory>(product?.category || "ropa");
  const [condition, setCondition] = useState<ProductCondition>(product?.condition || "Nuevo");
  const [sku, setSku] = useState(product?.sku || generateSKU("ropa", ""));
  const [size, setSize] = useState(product?.size || "M");
  const [color, setColor] = useState(product?.color || "");
  const [costPrice, setCostPrice] = useState(product?.cost_price ? String(product.cost_price) : "");
  const [salePrice, setSalePrice] = useState(product?.sale_price ? String(product.sale_price) : "");
  const [discountPrice, setDiscountPrice] = useState(product?.discount_price ? String(product.discount_price) : "");
  const [stock, setStock] = useState(product?.stock !== undefined ? String(product.stock) : "1");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [tags, setTags] = useState<string[]>(product?.tags || ["Destacado"]);

  const [showStudio, setShowStudio] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStudioImageReady = (url: string) => {
    setImages((prev) => [url, ...prev]);
    setShowStudio(false);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !salePrice) {
      alert("Por favor completa al menos el nombre y el precio de venta.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        id: product?.id,
        title,
        description,
        category,
        condition,
        sku,
        size,
        color,
        cost_price: Number(costPrice) || 0,
        sale_price: Number(salePrice) || 0,
        discount_price: discountPrice ? Number(discountPrice) : undefined,
        stock: Number(stock) || 0,
        is_active: isActive,
        tags,
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"],
      });
      onClose();
    } catch (err) {
      console.error("Error guardando producto:", err);
      alert("Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EFE6DF] my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F5EFEB] flex items-center justify-between bg-[#FAF7F2]/60">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#2C2A29]">
              {isEditing ? "Editar Prenda / Accesorio" : "Alta Rápida de Inventario"}
            </h2>
            <p className="text-xs text-[#5A5653]">
              Gestión de inventario y estudio fotográfico con fondo blanco
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5A5653] hover:text-[#2C2A29] hover:bg-[#F5EFEB]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* FOTOGRAFÍAS & ESTUDIO DE FONDO BLANCO */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#FAF7F2]/50 border border-[#EFE6DF]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#967056] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Fotos de Producto (Fondo Blanco Limpio)</span>
                </h4>
                <p className="text-[11px] text-[#5A5653]">
                  Toma fotos desde tu móvil o sube archivos para auto-limpiar el fondo
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowStudio(!showStudio)}
                className="px-3 py-1.5 rounded-xl bg-[#2C2A29] text-white hover:bg-[#4D3628] text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{showStudio ? "Cerrar Estudio" : "Abrir Estudio de Foto"}</span>
              </button>
            </div>

            {/* Componente del Estudio Fotográfico si está abierto */}
            {showStudio && (
              <div className="pt-2 animate-fade-in">
                <ImageStudio
                  onImageReady={handleStudioImageReady}
                  onCancel={() => setShowStudio(false)}
                />
              </div>
            )}

            {/* Miniatura de fotos cargadas */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                {images.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#DECEBF] group"
                  >
                    <Image
                      src={imgUrl}
                      alt={`Foto ${i + 1}`}
                      fill
                      sizes="100px"
                      className="object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-center bg-black/70 text-white rounded py-0.5">
                        Principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input manual de URL de imagen como alternativa rápida */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="O pegar URL de imagen externa..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#DECEBF] text-xs bg-white"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#DECEBF] text-xs font-semibold text-[#2C2A29] hover:bg-[#FAF7F2]"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* DATOS BÁSICOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">
                Nombre de la Prenda o Accesorio *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Collar Cadena Eslabón Chapa de Oro 18k"
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm focus:outline-none focus:ring-1 focus:ring-[#967056]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm bg-white"
              >
                <option value="joyeria">Cadenitas & Joyería Fina</option>
                <option value="ropa">Ropa de Marca</option>
                <option value="preloved">Segunda Mano / Pre-loved</option>
                <option value="outlet">Zona Outlet / Rebajas</option>
                <option value="accesorios">Bolsos & Accesorios</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">
                Estado de la Prenda
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm bg-white"
              >
                <option value="Nuevo">Nueva (100% Sin uso)</option>
                <option value="Pre-loved">Pre-Loved (Segunda Mano Impecable 10/10)</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#2C2A29]">SKU / Código</label>
                <button
                  type="button"
                  onClick={() => setSku(generateSKU(category, title))}
                  className="text-[10px] text-[#967056] font-semibold hover:underline"
                >
                  Auto-generar
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2A29]">Talla</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="XS, S, M, L, Única..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2A29]">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Dorado, Crema..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm"
                />
              </div>
            </div>
          </div>

          {/* PRECIOS Y COSTOS (CMV PARA CONTABILIDAD) */}
          <div className="p-4 rounded-2xl bg-[#F5EFEB]/60 border border-[#DECEBF] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#75543F]">
              Precios & Costo de Adquisición (CMV)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2A29]">
                  Costo de Compra (CMV) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5A5653]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="180.00"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#DECEBF] text-sm font-medium"
                  />
                </div>
                <span className="text-[10px] text-[#967056]">
                  Lo que costó adquirirla (Base para P&L)
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2C2A29]">
                  Precio de Venta Regular *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5A5653]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="450.00"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#DECEBF] text-sm font-bold text-[#2C2A29]"
                  />
                </div>
                <span className="text-[10px] text-[#5A5653]">Precio público visible</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A8535D]">
                  Precio Rebajado / Outlet
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5A5653]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#E8B4B8] text-sm font-medium"
                  />
                </div>
                <span className="text-[10px] text-[#A8535D]">
                  Genera el badge de oferta -%
                </span>
              </div>
            </div>
          </div>

          {/* STOCK & ESTADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#2C2A29]">
                Stock Inicial Disponible
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-sm"
              />
              <span className="text-[10px] text-[#5A5653]">
                Al llegar a 0 se ocultará automáticamente del catálogo
              </span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                id="is_active_toggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#967056] focus:ring-[#967056]"
              />
              <label htmlFor="is_active_toggle" className="text-xs text-[#2C2A29] cursor-pointer">
                <strong>Activo en Catálogo Público</strong>
                <p className="text-[11px] text-[#5A5653]">
                  Desmarcar para pausar visibilidad sin borrar
                </p>
              </label>
            </div>
          </div>

          {/* ETIQUETAS */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#2C2A29]">
              Etiquetas Destacadas
            </label>
            <div className="flex flex-wrap gap-2">
              {["Destacado", "Rebaja", "Outlet", "Tendencia", "Exclusivo"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    tags.includes(tag)
                      ? "bg-[#2C2A29] text-white border-[#2C2A29]"
                      : "bg-[#FAF7F2] text-[#5A5653] border-[#DECEBF] hover:bg-white"
                  }`}
                >
                  {tags.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#2C2A29]">
              Descripción / Cuidados
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la tela, medidas exactas o características de la joya..."
              className="w-full px-3.5 py-2 rounded-xl border border-[#DECEBF] text-xs focus:outline-none focus:ring-1 focus:ring-[#967056]"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F5EFEB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#DECEBF] text-xs font-semibold text-[#5A5653] hover:bg-[#FAF7F2]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#2C2A29] hover:bg-[#4D3628] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isEditing ? "Guardar Cambios" : "Dar de Alta Prenda"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
