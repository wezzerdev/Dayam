"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Wand2, RefreshCw, Check, Sliders, Image as ImageIcon, ZoomIn, SunMedium, Sparkles, X } from "lucide-react";
import { uploadProductImage } from "@/lib/store";

interface ImageStudioProps {
  onImageReady: (url: string) => void;
  onCancel?: () => void;
  initialImageUrl?: string;
}

export function ImageStudio({ onImageReady, onCancel, initialImageUrl }: ImageStudioProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(initialImageUrl || null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"3:4" | "1:1">("3:4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"result" | "original">("result");

  // Ajustes de procesamiento
  const [tolerance, setTolerance] = useState(38); // Tolerancia de color de fondo (0-100)
  const [brightness, setBrightness] = useState(105); // Brillo %
  const [contrast, setContrast] = useState(105); // Contraste %
  const [addShadow, setAddShadow] = useState(true); // Sombra sutil de catálogo
  const [scaleFactor, setScaleFactor] = useState(88); // Escala dentro del lienzo (80% a 95%)

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Carga de archivo
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalImage(dataUrl);
      setProcessedImage(null);
      // Auto-procesar en cuanto se carga
      setTimeout(() => {
        processImageAlgorithm(dataUrl, tolerance, brightness, contrast, addShadow, aspectRatio, scaleFactor);
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  // Algoritmo de procesamiento de imagen en Canvas
  const processImageAlgorithm = useCallback(
    (
      imgSrc: string,
      tol: number,
      bright: number,
      cont: number,
      shadow: boolean,
      ratio: "3:4" | "1:1",
      scalePct: number
    ) => {
      setIsProcessing(true);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgSrc;

      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Dimensiones estandarizadas de alta definición para catálogo
        const targetWidth = 1200;
        const targetHeight = ratio === "3:4" ? 1600 : 1200;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // 1. Fondo blanco puro de estudio
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // 2. Dibujar temporalmente la imagen original para extraer y segmentar
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.naturalWidth;
        tempCanvas.height = img.naturalHeight;
        const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
        if (!tempCtx) {
          setIsProcessing(false);
          return;
        }

        tempCtx.drawImage(img, 0, 0);
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imgData.data;

        // Muestrear las esquinas para determinar el color predominante del fondo
        const samplePoints = [
          [2, 2],
          [tempCanvas.width - 3, 2],
          [2, tempCanvas.height - 3],
          [tempCanvas.width - 3, tempCanvas.height - 3],
          [Math.floor(tempCanvas.width / 2), 2],
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        for (const [x, y] of samplePoints) {
          const idx = (y * tempCanvas.width + x) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        }
        bgR /= samplePoints.length;
        bgG /= samplePoints.length;
        bgB /= samplePoints.length;

        const maxDiff = (tol / 100) * 441.67; // Distancia euclidiana máxima en espacio RGB

        // Bounding box para recortar automáticamente alrededor del objeto detectado
        let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
        let detectedAny = false;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Distancia de color al fondo muestreado
          const dist = Math.sqrt(
            Math.pow(r - bgR, 2) +
            Math.pow(g - bgG, 2) +
            Math.pow(b - bgB, 2)
          );

          const pxIndex = i / 4;
          const pxX = pxIndex % tempCanvas.width;
          const pxY = Math.floor(pxIndex / tempCanvas.width);

          if (dist < maxDiff) {
            // Fondo detectado: volver transparente con difuminado suave en el borde
            const alphaRatio = Math.max(0, (maxDiff - dist) / 15);
            data[i + 3] = Math.min(data[i + 3], Math.floor((1 - alphaRatio) * 255));
          } else {
            // Objeto principal: registrar bounding box
            detectedAny = true;
            if (pxX < minX) minX = pxX;
            if (pxX > maxX) maxX = pxX;
            if (pxY < minY) minY = pxY;
            if (pxY > maxY) maxY = pxY;
          }
        }

        // Si no se detectó o la tolerancia es extrema, usar imagen centrada
        if (!detectedAny || maxX <= minX || maxY <= minY) {
          minX = 0;
          minY = 0;
          maxX = tempCanvas.width;
          maxY = tempCanvas.height;
        }

        // Agregar margen al bounding box
        const padX = Math.floor((maxX - minX) * 0.03);
        const padY = Math.floor((maxY - minY) * 0.03);
        const cropX = Math.max(0, minX - padX);
        const cropY = Math.max(0, minY - padY);
        const cropW = Math.min(tempCanvas.width - cropX, (maxX - minX) + padX * 2);
        const cropH = Math.min(tempCanvas.height - cropY, (maxY - minY) + padY * 2);

        tempCtx.putImageData(imgData, 0, 0);

        // 3. Calcular escalado y centrado sobre el lienzo de estudio de fondo blanco
        const maxAvailW = targetWidth * (scalePct / 100);
        const maxAvailH = targetHeight * (scalePct / 100);
        const scale = Math.min(maxAvailW / cropW, maxAvailH / cropH);

        const finalW = cropW * scale;
        const finalH = cropH * scale;
        const finalX = (targetWidth - finalW) / 2;
        const finalY = (targetHeight - finalH) / 2;

        // 4. Sombra suave de estudio fotográfico si está activa
        if (shadow) {
          ctx.save();
          ctx.beginPath();
          const shadowY = finalY + finalH - 10;
          const shadowW = finalW * 0.7;
          const shadowH = 26;
          ctx.ellipse(targetWidth / 2, shadowY, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
          const shadowGrad = ctx.createRadialGradient(
            targetWidth / 2, shadowY, 0,
            targetWidth / 2, shadowY, shadowW / 2
          );
          shadowGrad.addColorStop(0, "rgba(40, 30, 20, 0.16)");
          shadowGrad.addColorStop(0.6, "rgba(40, 30, 20, 0.06)");
          shadowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = shadowGrad;
          ctx.fill();
          ctx.restore();
        }

        // 5. Aplicar filtros de brillo y contraste al objeto
        ctx.save();
        ctx.filter = `brightness(${bright}%) contrast(${cont}%)`;
        ctx.drawImage(
          tempCanvas,
          cropX, cropY, cropW, cropH,
          finalX, finalY, finalW, finalH
        );
        ctx.restore();

        // 6. Generar WebP de alta compresión y calidad
        const resultUrl = canvas.toDataURL("image/webp", 0.92);
        setProcessedImage(resultUrl);
        setActiveTab("result");
        setIsProcessing(false);
      };

      img.onerror = () => {
        setIsProcessing(false);
      };
    },
    []
  );

  const handleApplyChanges = () => {
    if (!originalImage) return;
    processImageAlgorithm(
      originalImage,
      tolerance,
      brightness,
      contrast,
      addShadow,
      aspectRatio,
      scaleFactor
    );
  };

  const handleConfirmAndUpload = async () => {
    const imageToUpload = processedImage || originalImage;
    if (!imageToUpload) return;

    try {
      setIsUploading(true);

      // Convertir dataUrl a Blob para carga
      const res = await fetch(imageToUpload);
      const blob = await res.blob();
      const publicUrl = await uploadProductImage(blob);

      onImageReady(publicUrl);
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      // Fallback: enviar la dataUrl directamente
      if (imageToUpload) onImageReady(imageToUpload);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DECEBF] p-4 sm:p-6 shadow-card space-y-6">
      {/* Header Studio */}
      <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DECEBF] flex items-center justify-center text-[#967056]">
            <Wand2 className="w-5 h-5 text-[#967056]" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-[#2C2A29]">
              Estudio Fotográfico de Fondo Blanco
            </h3>
            <p className="text-xs text-[#5A5653]">
              Recorte automático, eliminación de sombras desordenadas y encuadre editorial
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-[#5A5653] hover:text-[#2C2A29] hover:bg-[#F5EFEB]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Inputs ocultos para captura directa */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {/* Si no hay imagen cargada: Botones de Captura */}
      {!originalImage ? (
        <div className="border-2 border-dashed border-[#DECEBF] rounded-2xl p-8 sm:p-12 text-center bg-[#FAF7F2]/40 hover:bg-[#FAF7F2] transition-colors space-y-4">
          <div className="w-16 h-16 rounded-full bg-white border border-[#DECEBF] flex items-center justify-center mx-auto text-[#967056] shadow-sm">
            <ImageIcon className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="font-medium text-sm text-[#2C2A29]">
              Captura o sube la foto de la prenda o joya
            </h4>
            <p className="text-xs text-[#5A5653] max-w-sm mx-auto">
              El sistema detectará el contorno del artículo y lo colocará sobre fondo blanco puro estándar para tu catálogo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2C2A29] text-[#FAF7F2] hover:bg-[#4D3628] text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Camera className="w-4 h-4 text-[#D4AF37]" />
              <span>Tomar con la Cámara</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#DECEBF] text-[#2C2A29] hover:bg-[#F5EFEB] text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-[#967056]" />
              <span>Subir de Galería</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspace del Estudio */
        <div className="space-y-6">
          {/* Controls Bar: Ratio & View Switch */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EFE6DF]">
            {/* Aspect Ratio Switch */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-[#967056] uppercase tracking-wider mr-2">
                Formato:
              </span>
              <button
                type="button"
                onClick={() => {
                  setAspectRatio("3:4");
                  setTimeout(handleApplyChanges, 50);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  aspectRatio === "3:4"
                    ? "bg-[#2C2A29] text-white shadow-sm font-semibold"
                    : "bg-white text-[#5A5653] hover:text-[#2C2A29]"
                }`}
              >
                3:4 (Moda / Editorial)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAspectRatio("1:1");
                  setTimeout(handleApplyChanges, 50);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  aspectRatio === "1:1"
                    ? "bg-[#2C2A29] text-white shadow-sm font-semibold"
                    : "bg-white text-[#5A5653] hover:text-[#2C2A29]"
                }`}
              >
                1:1 (Joyería / Cuadrado)
              </button>
            </div>

            {/* View tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#DECEBF]">
              <button
                type="button"
                onClick={() => setActiveTab("result")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === "result"
                    ? "bg-[#FAF7F2] text-[#2C2A29] font-bold shadow-sm"
                    : "text-[#5A5653]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 inline mr-1 text-[#EE2F74]" />
                Fondo Blanco Puro
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("original")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeTab === "original"
                    ? "bg-[#FAF7F2] text-[#2C2A29] font-bold shadow-sm"
                    : "text-[#5A5653]"
                }`}
              >
                Original
              </button>
            </div>
          </div>

          {/* Canvas & Preview Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visualizer */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div
                className={`relative w-full max-w-sm rounded-2xl overflow-hidden border border-[#DECEBF] bg-[#FFFFFF] shadow-sm flex items-center justify-center p-3 ${
                  aspectRatio === "3:4" ? "aspect-[3/4]" : "aspect-square"
                }`}
              >
                {/* Canvas oculto de renderizado */}
                <canvas ref={canvasRef} className="hidden" />

                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center space-y-3 text-[#967056]">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#B08D73]" />
                    <p className="text-xs font-medium">Auto-limpiando y estandarizando fondo blanco...</p>
                  </div>
                ) : activeTab === "result" && processedImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={processedImage}
                    alt="Foto procesada con fondo blanco"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={originalImage || ""}
                    alt="Foto original"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Badge en esquina */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F2]/90 border border-[#DECEBF] text-[#2C2A29]">
                    {activeTab === "result" ? "Fondo Blanco Calibrado" : "Foto Original"}
                  </span>
                </div>
              </div>

              {/* Botón rápido para volver a tomar */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="text-xs text-[#5A5653] hover:text-[#2C2A29] flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tomar otra</span>
                </button>
                <span className="text-[#DECEBF]">•</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-[#5A5653] hover:text-[#2C2A29] flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir otra</span>
                </button>
              </div>
            </div>

            {/* Adjustments Panel */}
            <div className="lg:col-span-5 bg-[#FAF7F2]/50 p-4 rounded-xl border border-[#EFE6DF] space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#EFE6DF]">
                <div className="flex items-center gap-1.5 font-semibold text-[#2C2A29]">
                  <Sliders className="w-3.5 h-3.5 text-[#967056]" />
                  <span>Ajustes de Auto-Limpieza</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyChanges}
                  disabled={isProcessing}
                  className="text-[11px] font-semibold text-[#967056] hover:text-[#75543F] flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Recalcular</span>
                </button>
              </div>

              {/* Tolerancia */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#5A5653]">
                  <span>Sensibilidad de Fondo</span>
                  <strong>{tolerance}%</strong>
                </div>
                <input
                  type="range"
                  min="15"
                  max="70"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  onMouseUp={handleApplyChanges}
                  onTouchEnd={handleApplyChanges}
                  className="w-full accent-[#967056] cursor-pointer"
                />
              </div>

              {/* Escala / Encuadre */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#5A5653]">
                  <span>Tamaño / Encuadre Prenda</span>
                  <strong>{scaleFactor}%</strong>
                </div>
                <input
                  type="range"
                  min="75"
                  max="95"
                  value={scaleFactor}
                  onChange={(e) => setScaleFactor(Number(e.target.value))}
                  onMouseUp={handleApplyChanges}
                  onTouchEnd={handleApplyChanges}
                  className="w-full accent-[#967056] cursor-pointer"
                />
              </div>

              {/* Brillo */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#5A5653]">
                  <span>Brillo Prenda</span>
                  <strong>{brightness}%</strong>
                </div>
                <input
                  type="range"
                  min="90"
                  max="125"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  onMouseUp={handleApplyChanges}
                  onTouchEnd={handleApplyChanges}
                  className="w-full accent-[#967056] cursor-pointer"
                />
              </div>

              {/* Sombra de Estudio */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#5A5653]">Sombra Suave de Estudio</span>
                <input
                  type="checkbox"
                  checked={addShadow}
                  onChange={(e) => {
                    setAddShadow(e.target.checked);
                    setTimeout(handleApplyChanges, 50);
                  }}
                  className="w-4 h-4 rounded text-[#967056] focus:ring-[#967056] cursor-pointer"
                />
              </div>

              {/* Botón Aplicar */}
              <button
                type="button"
                onClick={handleApplyChanges}
                disabled={isProcessing}
                className="w-full py-2 rounded-lg bg-white border border-[#DECEBF] hover:bg-[#FAF7F2] font-semibold text-[#2C2A29] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Aplicar Ajustes & Re-procesar</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#F5EFEB]">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#DECEBF] text-xs font-semibold text-[#5A5653] hover:bg-[#FAF7F2]"
              >
                Cancelar
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmAndUpload}
              disabled={isUploading || isProcessing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2C2A29] hover:bg-[#4D3628] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  <span>Guardando en Supabase Storage...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Usar Esta Foto con Fondo Blanco</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
