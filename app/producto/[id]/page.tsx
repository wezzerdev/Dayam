"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Product } from "@/lib/types";
import { getProductById } from "@/lib/store";
import { formatCurrency, buildWhatsAppOrderUrl } from "@/lib/utils";
import { 
  MessageCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Tag, 
  Sparkles, 
  RefreshCw, 
  ShoppingBag, 
  BookmarkCheck,
  Check,
  Phone
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart, openCart } = useCart();

  const displayPhone = "+52 55 1234 5678";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      setLoading(true);
      const data = await getProductById(params.id as string);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white text-[#18181B]">
        <Navbar />
        <div className="py-32 text-center text-[#EE2F74] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm font-bold text-[#18181B]">Cargando prenda...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white text-[#18181B]">
        <Navbar />
        <div className="py-32 text-center space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">Prenda no encontrada</h2>
          <p className="text-xs text-[#71717A]">Es posible que esta pieza ya haya sido apartada o vendida.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EE2F74] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"];

  const currentPrice = product.discount_price || product.sale_price;
  const layawayDeposit = currentPrice * 0.3;

  const whatsappUrl = buildWhatsAppOrderUrl({
    title: product.title,
    sku: product.sku,
    size: product.size,
    price: currentPrice,
  });

  const handleAddToCart = () => {
    addToCart(product, 1, product.size || "Única");
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#18181B]">
      <Navbar />

      <main className="flex-1 py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#EE2F74] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="bg-white rounded-3xl overflow-hidden border border-[#FCE7F3] shadow-card grid grid-cols-1 md:grid-cols-2">
          {/* Photos */}
          <div className="bg-white p-6 sm:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#FCE7F3]">
            <div className="relative aspect-[3/4] w-full max-w-sm rounded-3xl overflow-hidden bg-white shadow-inner flex items-center justify-center border border-[#FFF1F5]">
              <Image
                src={images[selectedImgIdx]}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 450px"
                className="object-contain p-2"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImgIdx(i)}
                    className={`relative w-14 h-16 rounded-2xl overflow-hidden bg-white border-2 transition-all ${
                      selectedImgIdx === i ? "border-[#EE2F74] scale-105" : "border-[#FCE7F3] opacity-60"
                    }`}
                  >
                    <Image src={img} alt="Vista" fill sizes="60px" className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-gradient-to-b from-[#FFF5F8]/30 to-white">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#FFF1F5] border border-[#FCE7F3] text-[#EE2F74]">
                  Ref: {product.sku}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-white border border-[#FBCFE8] text-[#BE185D]">
                  {product.condition}
                </span>
              </div>

              <h1 className="font-serif text-3xl font-bold text-[#18181B]">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 py-2 border-y border-[#FCE7F3]">
                <span className="font-serif text-3xl font-extrabold text-[#18181B]">
                  {formatCurrency(currentPrice)}
                </span>
                {product.discount_price && (
                  <span className="text-base text-[#A1A1AA] line-through">
                    {formatCurrency(product.sale_price)}
                  </span>
                )}
              </div>

              {/* Sistema de apartado card */}
              <div className="p-3.5 rounded-2xl bg-[#FFF1F5] border border-[#FCE7F3] space-y-1">
                <span className="text-xs font-bold text-[#BE185D] flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-[#EE2F74]" />
                  <span>¡Sistema de Apartado con 30%!</span>
                </span>
                <p className="text-xs text-[#71717A]">
                  Aparta hoy con <strong>{formatCurrency(layawayDeposit)}</strong> y liquida el resto en 20 días.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-[#FCE7F3]">
                  <span className="text-[#EE2F74] font-semibold block">Talla:</span>
                  <strong className="text-sm text-[#18181B]">{product.size || "Única"}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#FCE7F3]">
                  <span className="text-[#EE2F74] font-semibold block">Color:</span>
                  <strong className="text-sm text-[#18181B]">{product.color || "Según imagen"}</strong>
                </div>
              </div>

              <div className="text-xs text-[#52525B] space-y-1">
                <strong className="text-[#18181B] block">Descripción:</strong>
                <p>{product.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#BE185D] pt-1">
                <Phone className="w-3.5 h-3.5 text-[#EE2F74]" />
                <span>Informes telefónicos: <strong>{displayPhone}</strong></span>
              </div>
            </div>

            {/* Actions: Add to Cart and WhatsApp */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                  justAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] text-white hover:opacity-95 shadow-[#EE2F74]/25"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar al Carrito de Compras</span>
                  </>
                )}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>Pedir directamente por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
