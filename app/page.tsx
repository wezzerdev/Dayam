"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroBanner } from "@/components/catalog/hero-banner";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductModal } from "@/components/catalog/product-modal";
import { ScrollWorld } from "@/components/catalog/scroll-world";
import { Product } from "@/lib/types";
import { getProducts } from "@/lib/store";
import { MessageCircle, Sparkles, RefreshCw, ShoppingBag, Phone, BookmarkCheck } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("todos");
  const [sortBy, setSortBy] = useState("newest");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const { openCart, totalItems } = useCart();

  const catalogSectionRef = useRef<HTMLDivElement>(null);
  const paseoSectionRef = useRef<HTMLDivElement>(null);

  const loadActiveProducts = async () => {
    setLoading(true);
    // Solo productos con stock > 0 y activos
    const data = await getProducts(true);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadActiveProducts();
  }, []);

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToPaseo = () => {
    paseoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectOutlet = () => {
    setSelectedCategory("outlet");
    scrollToCatalog();
  };

  // Filtrado y ordenación
  const filteredProducts = products
    .filter((p) => {
      // Categoría
      const matchesCategory =
        selectedCategory === "todos"
          ? true
          : selectedCategory === "outlet"
          ? Boolean(p.discount_price && p.discount_price < p.sale_price) || p.tags?.includes("Outlet")
          : p.category === selectedCategory;

      // Condición (Nuevo vs Pre-loved)
      const matchesCondition =
        selectedCondition === "todos" ? true : p.condition === selectedCondition;

      // Búsqueda por texto (nombre, SKU, color, descripción)
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.color && p.color.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term));

      return matchesCategory && matchesCondition && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = a.discount_price || a.sale_price;
      const priceB = b.discount_price || b.sale_price;

      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      // newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const displayPhone = "56 1289 4359";

  return (
    <div className="flex flex-col min-h-screen bg-white text-[#18181B]">
      {/* Header Chic Glam */}
      <Navbar
        activeCategory={selectedCategory}
        onCategorySelect={(cat) => {
          if (cat === "paseo") {
            scrollToPaseo();
          } else {
            setSelectedCategory(cat);
            scrollToCatalog();
          }
        }}
      />

      {/* Hero Visual Editorial Banner */}
      <HeroBanner
        onScrollToCatalog={scrollToCatalog}
        onSelectOutlet={handleSelectOutlet}
        onScrollToPaseo={scrollToPaseo}
      />

      {/* Scroll-World: Paseo Virtual Inmersivo por la Boutique */}
      <div ref={paseoSectionRef}>
        <ScrollWorld
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToCatalog();
          }}
          onScrollToCatalog={scrollToCatalog}
        />
      </div>

      {/* Main Catalog Section */}
      <main ref={catalogSectionRef} className="flex-1 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFE4EC] text-[#BE185D] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#EE2F74]" />
              <span>Colección Exclusiva & Apartados</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#18181B]">
              Catálogo de Temporada
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A]">
              Agrega todas las prendas que desees a tu carrito y pide todo en un solo mensaje de WhatsApp o apártalas con el 30%.
            </p>
          </div>

          {/* Category, Condition & Search Controls */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCondition={selectedCondition}
            onSelectCondition={setSelectedCondition}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProductsCount={filteredProducts.length}
          />

          {/* Product Grid */}
          {loading ? (
            <div className="py-24 text-center text-[#EE2F74] flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-sm font-bold text-[#18181B]">Cargando catálogo exclusivo...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-[#FCE7F3] p-8 space-y-4 shadow-sm">
              <ShoppingBag className="w-12 h-12 text-[#FBCFE8] mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#18181B]">
                  No encontramos prendas con estos filtros
                </h3>
                <p className="text-xs text-[#71717A] max-w-sm mx-auto">
                  Prueba cambiando de categoría o limpiando el buscador para ver todas las piezas disponibles.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("todos");
                  setSelectedCondition("todos");
                  setSearchTerm("");
                }}
                className="px-6 py-2.5 rounded-full bg-[#EE2F74] text-white text-xs font-bold shadow-md shadow-[#EE2F74]/20 hover:bg-[#D9165C] transition-all"
              >
                Ver Todo el Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenModal={(p) => setActiveModalProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalle de Producto */}
      <ProductModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />

      {/* Botón Flotante Permanente de WhatsApp (Solo en Desktop, en móvil ya está en la barra inferior) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 items-end gap-3">
        <a
          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            "¡Hola Dayam Boutique! Me gustaría recibir informes sobre prendas y sistema de apartado."
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Pedir Informes por WhatsApp"
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 group relative"
        >
          <MessageCircle className="w-7 h-7 fill-white" />
          <span className="absolute right-16 bg-[#18181B] text-white text-xs font-bold py-1.5 px-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Informes: {displayPhone}
          </span>
        </a>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
