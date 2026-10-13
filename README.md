# Dayam Boutique & Accesorios — Plataforma Web & Panel Administrativo

Plataforma web de alta conversión y sistema SaaS de gestión contable/inventario para boutique de moda femenina, joyería fina en chapa de oro de 18k y selección sustentable Pre-Loved.

---

## 🌟 Características Principales

### 1. Catálogo Público de Alta Conversión (Landing Page)
- **Look Editorial Chic & Contemporáneo:** Paleta en tonos neutros cálidos (marfil, crema, pizarra suave) con acentos en oro champagne y rosa empolvado.
- **Filtros por Categoría & Etiquetas:**
  - Cadenitas y Joyería fina (chapa de oro 18k).
  - Ropa de Marca de temporada.
  - Segunda Mano / Pre-loved (ropa usada en estado impecable 10/10).
  - Zona Outlet / Rebajas (con cálculo automático de % de descuento).
- **Fotografía de Catálogo:** Fotos con fondo blanco puro estandarizado (aspect ratio 3:4 o 1:1) y carrusel interactivo.
- **Botón "Pedir por WhatsApp":**
  Genera el enlace dinámico `https://wa.me/...` con el mensaje exacto pre-cargado:
  > *"¡Hola! Me encantó este producto: [Nombre] (Ref: [SKU], Talla: [Talla], Precio: $[Precio]). ¿Sigue disponible para apartarlo?"*
- **Persistencia de Stock:** Solo se muestran prendas con `stock > 0` y estado `is_active = true`. Si una prenda se agota, se oculta instantáneamente.

### 2. Panel Administrativo Seguro (Admin Dashboard)
- **Módulo A: Carga Rápida de Inventario (Mobile-Friendly):**
  - Captura directa desde la cámara del celular o selector de galería.
  - **Estudio Fotográfico de Fondo Blanco Automatizado:** Algoritmo de canvas que detecta la prenda/joya, elimina fondos ruidosos, coloca fondo blanco puro `#FFFFFF`, centra la prenda y añade sombra suave de catálogo.
  - Formulario de alta rápido con Costo de Adquisición (CMV), Precio de Venta regular y Precio Rebajado.
- **Módulo B: Registro y Cobro de Ventas (Pedidos WhatsApp a Venta Cerrada):**
  - Selector rápido de prenda o búsqueda por SKU.
  - Cobro por Transferencia, Efectivo o Tarjeta.
  - Al dar clic en **"Confirmar y Cobrar"**:
    1. Descuenta automáticamente el stock en base de datos.
    2. Si el stock llega a 0, se oculta del catálogo público.
    3. Registra el ingreso bruto, el costo de mercancía vendida (CMV) y la ganancia neta en los libros contables.
- **Módulo C: Finanzas en Tiempo Real (Balance General & Estado de Resultados P&L):**
  - **Estado de Resultados (P&L):**
    - (+) Ingresos por Ventas
    - (-) Costo de Mercancías Vendidas (CMV)
    - (=) Utilidad Bruta
    - (-) Gastos Operativos (Envíos, Empaques, Publicidad, Servicios)
    - (=) Utilidad Neta del periodo (Filtro: Hoy, Mes, Año, Histórico).
  - **Balance General / Resumen de Activos:**
    - Activo Circulante: Efectivo en caja/banco acumulado + Valor del Inventario actual (a costo de compra).
    - Tarjetas ejecutivas con margen %, piezas en stock y piezas vendidas.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Base de Datos & Auth:** Supabase (PostgreSQL, Supabase Auth, Storage Buckets, Row Level Security habilitado).
- **Procesamiento de Fotos:** HTML5 Canvas API inteligente con segmentación y reemplazo a fondo blanco `#FFFFFF` en aspect ratio 3:4 / 1:1.
- **Despliegue:** Docker Multi-Stage (`Dockerfile` con standalone output) optimizado para Dokploy o VPS.

---

## 🚀 Despliegue en Dokploy / Docker VPS

El proyecto incluye un `Dockerfile` optimizado con compilación standalone de Next.js.

### Pasos en Dokploy:
1. Crea una nueva aplicación de tipo **Docker** o **GitHub Repository**.
2. Conecta el repositorio de este proyecto.
3. Dokploy detectará automáticamente el archivo `Dockerfile`.
4. Agrega las Variables de Entorno en el panel de Dokploy:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   NEXT_PUBLIC_STORE_NAME="Boutique & Accesorios Dayam"
   NEXT_PUBLIC_WHATSAPP_PHONE=5215512345678
   NEXT_PUBLIC_CURRENCY_SYMBOL="$"
   NEXT_PUBLIC_CURRENCY_CODE="MXN"
   ```
5. Asigna el puerto de la aplicación: `3000`.
6. Haz clic en **Deploy**.

---

## 🗄️ Configuración de Supabase (SQL Migration)

1. En tu proyecto de Supabase, ve a **SQL Editor**.
2. Abre el archivo [`supabase/schema.sql`](file:///c:/Users/duart/OneDrive/Documentos/Butique%20Dayam/supabase/schema.sql).
3. Pega su contenido y presiona **Run**.
4. Esto creará:
   - Tabla `products` con triggers de actualización y descuento de stock.
   - Tabla `sales` con cálculo de utilidades.
   - Tabla `expenses` con categorías de gastos operativos.
   - Políticas RLS (lectura pública para productos activos con stock; control total para administradores autenticados).
   - Bucket de almacenamiento `product-images` con políticas públicas de lectura y autenticadas de subida.
   - Datos iniciales de demostración.
