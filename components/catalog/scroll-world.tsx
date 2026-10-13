"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ShoppingBag, 
  BookmarkCheck, 
  ArrowDown, 
  ArrowUp,
  Compass, 
  Eye, 
  ChevronRight, 
  Phone, 
  MessageCircle, 
  Play, 
  Pause,
  MousePointer2,
  Footprints,
  RotateCcw
} from "lucide-react";
import { formatCurrency, formatPhoneNumber } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface ScrollWorldProps {
  onSelectCategory?: (category: string) => void;
  onScrollToCatalog?: () => void;
}

interface Station {
  id: number;
  badge: string;
  title: string;
  location: string;
  description: string;
  categoryFilter: string;
  videoTimeHint: string;
  scrollTarget: number; // 0 a 1
  hotspot: {
    title: string;
    price: number;
    tag: string;
    top: string;
    left: string;
  };
  highlightQuote: string;
}

const STATIONS: Station[] = [
  {
    id: 1,
    badge: "Bienvenida & Tendencias",
    location: "Hall Principal de la Boutique",
    title: "Percheros de Nueva Temporada",
    description:
      "Al dar tus primeros pasos por Dayam, te reciben las texturas suaves, los vestidos vaporosos y los cortes pensados para estilizar tu figura.",
    categoryFilter: "ropa",
    videoTimeHint: "0:00 - 0:03",
    scrollTarget: 0.05,
    hotspot: {
      title: "Vestido Midi Rosa Glam",
      price: 650,
      tag: "Nueva Temporada",
      top: "42%",
      left: "68%",
    },
    highlightQuote: "Prendas que combinan sofisticación y frescura diaria.",
  },
  {
    id: 2,
    badge: "Chapa de Oro 18k",
    location: "Vitrina de Accesorios Central",
    title: "Galería de Joyería Fina & Cadenitas",
    description:
      "Avanzas y te detienes frente al resplandor dorado. Cada collar, arete y pulsera cuenta con baño de oro de 18 quilates hipoalergénico con acabado de alta durabilidad.",
    categoryFilter: "joyeria",
    videoTimeHint: "0:03 - 0:06",
    scrollTarget: 0.35,
    hotspot: {
      title: "Gargantilla Triple Eslabón 18k",
      price: 380,
      tag: "Hipoalergénico",
      top: "36%",
      left: "32%",
    },
    highlightQuote: "El toque de brillo perfecto que eleva cualquier outfit.",
  },
  {
    id: 3,
    badge: "Moda Sustentable",
    location: "Rincón Exclusivo Pre-Loved",
    title: "Curaduría Vintage & Segundas Oportunidades",
    description:
      "Caminas hacia una sección llena de personalidad. Ropa de marcas reconocidas cuidadosamente inspeccionada, limpia y en estado impecable a precios especiales.",
    categoryFilter: "preloved",
    videoTimeHint: "0:06 - 0:09",
    scrollTarget: 0.65,
    hotspot: {
      title: "Blazer Oversize Silueta Chic",
      price: 490,
      tag: "Pre-Loved Premium",
      top: "48%",
      left: "62%",
    },
    highlightQuote: "Estilo sustentable con historia y ahorro inteligente.",
  },
  {
    id: 4,
    badge: "Atención Personalizada",
    location: "Salón de Probador & Apartados",
    title: "Aparta con el 30% & Asesoría",
    description:
      "Llegas a la zona de probadores con la tranquilidad de que tus piezas favoritas no se te escaparán. Puedes apartar cualquier prenda con solo el 30% y liquidar en 20 días.",
    categoryFilter: "todos",
    videoTimeHint: "0:09 - 0:11",
    scrollTarget: 0.95,
    hotspot: {
      title: "Sistema de Apartado Dayam",
      price: 240,
      tag: "Anticipo desde 30%",
      top: "40%",
      left: "48%",
    },
    highlightQuote: "Pregunta disponibilidad o apártalo vía WhatsApp al 56 1289 4359.",
  },
];

export function ScrollWorld({ onSelectCategory, onScrollToCatalog }: ScrollWorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(11.08);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [activeStationIndex, setActiveStationIndex] = useState(0);
  const [showHotspotModal, setShowHotspotModal] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"forward" | "backward" | "idle">("idle");
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const targetTimeRef = useRef(0);
  const lastScrollY = useRef(0);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Transformaciones sutiles de profundidad para aumentar la sensación inmersiva
  const cameraScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1.1]);
  const overlayVignette = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.3, 0.45]);

  // 1. Inicialización del video: pausarlo y preparar metadatos
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      if (video.duration && !Number.isNaN(video.duration)) {
        setVideoDuration(video.duration);
      }
      video.pause();
      video.currentTime = 0;
      setIsVideoReady(true);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", () => setIsVideoReady(true));

    if (video.readyState >= 1) {
      if (video.duration && !Number.isNaN(video.duration)) {
        setVideoDuration(video.duration);
      }
      video.pause();
      setIsVideoReady(true);
    }

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  // 2. Motor de sincronización Frame-a-Scroll con interpolación suave (LERP)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      if (!isAutoPlaying && video.readyState >= 2 && video.duration) {
        const target = targetTimeRef.current;
        const current = video.currentTime;
        const delta = target - current;

        // Si hay diferencia, avanzar o retroceder el video gradualmente
        if (Math.abs(delta) > 0.015) {
          // Factor LERP: 0.30 proporciona respuesta instantánea y fluida sin saltos
          const nextTime = current + delta * 0.3;
          video.currentTime = Math.max(0, Math.min(video.duration - 0.05, nextTime));
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isAutoPlaying]);

  // 3. Escuchar el progreso del scroll y calcular el tiempo objetivo del video
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setCurrentProgress(latest);

      const video = videoRef.current;
      const dur = (video && video.duration && !Number.isNaN(video.duration)) ? video.duration : videoDuration;

      if (!isAutoPlaying) {
        targetTimeRef.current = Math.max(0, Math.min(dur, latest * dur));
      }

      // Detección de dirección de marcha (avanzando o retrocediendo)
      if (latest > lastScrollY.current + 0.003) {
        setScrollDirection("forward");
      } else if (latest < lastScrollY.current - 0.003) {
        setScrollDirection("backward");
      }
      lastScrollY.current = latest;

      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => {
        setScrollDirection("idle");
      }, 350);

      // Calcular estación actual según progreso (4 zonas)
      let index = Math.min(Math.floor(latest * 4), 3);
      if (latest >= 0.94) index = 3;
      setActiveStationIndex(index);
    });

    return () => {
      unsubscribe();
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [scrollYProgress, videoDuration, isAutoPlaying]);

  const activeStation = STATIONS[activeStationIndex] || STATIONS[0];

  // Desplazar suavemente a una estación específica al tocar su botón
  const scrollToStation = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const targetScroll = containerTop + (index / 3.4) * (containerHeight - viewportHeight);

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  // Alternar modo auto-paseo (avanza el scroll automáticamente)
  const toggleAutoTour = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    } else {
      setIsAutoPlaying(true);
      autoPlayIntervalRef.current = setInterval(() => {
        if (!containerRef.current) return;
        const containerTop = containerRef.current.offsetTop;
        const containerHeight = containerRef.current.offsetHeight;
        const currentScroll = window.scrollY;
        const maxScroll = containerTop + containerHeight - window.innerHeight;

        if (currentScroll >= maxScroll - 50) {
          setIsAutoPlaying(false);
          if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
          return;
        }

        window.scrollBy({ top: 12, behavior: "auto" });
      }, 25);
    }
  };

  // Detener auto-tour si el usuario interactúa manualmente
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isAutoPlaying) {
        setIsAutoPlaying(false);
        if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
      }
    };

    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchmove", handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchmove", handleUserInteraction);
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, [isAutoPlaying]);

  const handleGoToCatalogCategory = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (onScrollToCatalog) {
      onScrollToCatalog();
    }
  };

  const rawPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "525612894359";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  // Cálculo del tiempo actual del video en formato 0:00
  const currentTimeSeconds = (currentProgress * videoDuration).toFixed(1);

  return (
    <section
      ref={containerRef}
      className="relative h-[380vh] bg-[#0A0508] text-white select-none"
    >
      {/* Viewport Fijo / Sticky (Pantalla completa mientras la clienta hace scroll) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* Video de Fondo Sincronizado Cuadro a Cuadro */}
        <motion.div
          style={{ scale: cameraScale }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <video
            ref={videoRef}
            src="/videos/boutique-walk.mp4"
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover object-center brightness-[0.95] contrast-[1.06]"
          />

          {/* Gradiente Chic: Viñeta y atmósfera glam para alta legibilidad */}
          <motion.div
            style={{ opacity: overlayVignette }}
            className="absolute inset-0 bg-gradient-to-t from-[#140811] via-[#140811]/30 to-[#140811]/60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#140811]/75 via-transparent to-[#140811]/75" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
        </motion.div>

        {/* HUD SUPERIOR: Barra de Control del Paseo */}
        <div className="relative z-20 px-4 sm:px-8 pt-4 sm:pt-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Indicador de Movimiento en Tiempo Real */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
              {scrollDirection === "forward" ? (
                <>
                  <Footprints className="w-4 h-4 text-[#EE2F74] animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Caminando hacia adelante...
                  </span>
                </>
              ) : scrollDirection === "backward" ? (
                <>
                  <ArrowUp className="w-4 h-4 text-[#F43F5E] animate-bounce" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Retrocediendo...
                  </span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-[#EE2F74]" />
                  <span className="text-xs uppercase tracking-widest font-bold text-white">
                    Paseo Boutique Dayam
                  </span>
                </>
              )}
              <span className="text-white/30 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-[#FBCFE8] hidden sm:inline">
                Estación {activeStationIndex + 1} de 4 ({currentTimeSeconds}s)
              </span>
            </div>

            {/* Controles: Auto-Paseo & Saltar al Catálogo */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAutoTour}
                className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 backdrop-blur-md border transition-all ${
                  isAutoPlaying
                    ? "bg-[#EE2F74] text-white border-[#EE2F74] shadow-lg shadow-[#EE2F74]/30"
                    : "bg-black/50 hover:bg-black/70 text-white/90 border-white/15"
                }`}
                title={isAutoPlaying ? "Pausar avance automático" : "Avanzar automáticamente"}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#EE2F74]" />
                    <span>Auto-Paseo</span>
                  </>
                )}
              </button>

              <button
                onClick={onScrollToCatalog}
                className="px-4 py-1.5 rounded-full bg-[#EE2F74] hover:bg-[#D9165C] text-white text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-[#EE2F74]/20 transition-all"
              >
                <span>Ver Catálogo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Barra de Progreso del Video / Scrubbing Timeline */}
          <div className="max-w-7xl mx-auto mt-3">
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#D9165C] via-[#EE2F74] to-[#F43F5E] rounded-full transition-all duration-75"
                style={{ width: `${Math.min(100, currentProgress * 100)}%` }}
              />
            </div>

            {/* Selector Rápido de Estaciones (Mini Pasos que desplazan al punto exacto) */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
              {STATIONS.map((station, index) => {
                const isActive = activeStationIndex === index;
                return (
                  <button
                    key={station.id}
                    onClick={() => scrollToStation(index)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium transition-all whitespace-nowrap backdrop-blur-md ${
                      isActive
                        ? "bg-white/25 text-white border border-[#EE2F74] shadow-md font-bold"
                        : "bg-black/40 text-white/60 hover:text-white border border-white/5"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-[#EE2F74] animate-ping" : "bg-white/30"
                      }`}
                    />
                    <span>
                      {station.id}. {station.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTRO: Hotspot Interactivo en Pantalla (Prenda sincronizada con el momento del paseo) */}
        <div className="relative z-20 flex-1 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full max-w-7xl mx-auto px-4">
            <motion.div
              key={`hotspot-${activeStation.id}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                top: activeStation.hotspot.top,
                left: activeStation.hotspot.left,
              }}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative group">
                {/* Pulso de atención */}
                <span className="absolute -inset-2 rounded-full bg-[#EE2F74]/40 animate-ping" />
                <button
                  onClick={() => setShowHotspotModal(!showHotspotModal)}
                  className="relative flex items-center gap-2 bg-[#18181B]/90 hover:bg-[#18181B] backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-[#EE2F74]/60 shadow-2xl transition-all hover:scale-105"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EE2F74]" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {activeStation.hotspot.title}
                  </span>
                  <span className="text-xs font-serif font-bold text-[#F472B6]">
                    {formatCurrency(activeStation.hotspot.price)}
                  </span>
                  <Eye className="w-3.5 h-3.5 text-[#EE2F74] ml-0.5" />
                </button>

                {/* Tooltip / Modal Rápido de Prenda */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#18181B]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex items-center justify-between text-[10px] text-[#FBCFE8] uppercase tracking-wider font-bold mb-1">
                    <span>{activeStation.hotspot.tag}</span>
                    <span className="text-[#A1A1AA]">En exhibición</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    {activeStation.hotspot.title}
                  </h4>
                  <p className="text-[11px] text-[#D4D4D8] mb-3">
                    Disponible en tienda física y para apartado con el 30%.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGoToCatalogCategory(activeStation.categoryFilter)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#EE2F74] hover:bg-[#D9165C] text-white text-[11px] font-bold text-center transition-colors"
                    >
                      Ver en Catálogo
                    </button>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `¡Hola Dayam Boutique! Vi la pieza "${activeStation.hotspot.title}" durante el paseo virtual. ¿Sigue disponible para apartarla con el 30%?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white transition-colors"
                      title="Pedir por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* HUD INFERIOR: Tarjeta Descriptiva Sincronizada con la Parada Actual */}
        <div className="relative z-20 px-4 sm:px-8 pb-6 sm:pb-8">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStation.id}
                initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.35 }}
                className="bg-[#18181B]/90 hover:bg-[#18181B]/95 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden"
              >
                {/* Acento glam superior */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#EE2F74] to-transparent" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Textos descriptivos */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EE2F74]/20 border border-[#EE2F74]/40 text-[#F472B6] text-[11px] font-bold uppercase tracking-wider">
                        {activeStation.badge}
                      </span>
                      <span className="text-xs text-[#A1A1AA]">
                        {activeStation.location}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {activeStation.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed max-w-2xl">
                      {activeStation.description}
                    </p>

                    <p className="text-xs text-[#FBCFE8] font-medium italic pt-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#EE2F74] shrink-0" />
                      <span>{activeStation.highlightQuote}</span>
                    </p>
                  </div>

                  {/* Acciones principales para el usuario */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 min-w-[200px]">
                    <button
                      onClick={() => handleGoToCatalogCategory(activeStation.categoryFilter)}
                      className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#EE2F74] to-[#F43F5E] hover:from-[#D9165C] hover:to-[#E11D48] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-[#EE2F74]/25 transition-all transform hover:scale-[1.02]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Explorar esta Zona</span>
                    </button>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `¡Hola Dayam Boutique! Estoy haciendo el recorrido virtual en la estación de "${activeStation.title}". Me gustaría recibir informes de prendas y sistema de apartado.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>Apartar por WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Guía Visual de Paseo al pie de la tarjeta */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A1A1AA]">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="w-3.5 h-3.5 text-[#EE2F74] animate-bounce" />
                    <span className="font-medium text-white/90">
                      Desliza hacia abajo con tu dedo o ratón para avanzar el video
                    </span>
                  </div>
                  <span className="font-mono text-white/60 font-bold">
                    {Math.round(currentProgress * 100)}% del paseo
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
