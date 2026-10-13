-- ====================================================================
-- BOUTIQUE & ACCESORIOS - ESQUEMA DE BASE DE DATOS SUPABASE
-- Migración completa: Tablas, Índices, RLS, Storage y Trigger de Stock
-- ====================================================================

-- 1. Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: products (Catálogo e Inventario)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'joyeria', 'ropa', 'preloved', 'outlet', 'accesorios'
    condition TEXT NOT NULL DEFAULT 'Nuevo' CHECK (condition IN ('Nuevo', 'Pre-loved')),
    sku TEXT UNIQUE,
    size TEXT,             -- 'Única', 'XS', 'S', 'M', 'L', 'XL', etc.
    color TEXT,
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,  -- Costo de Adquisición (CMV)
    sale_price NUMERIC(10,2) NOT NULL,               -- Precio Regular de Venta
    discount_price NUMERIC(10,2),                    -- Precio de Rebaja / Outlet
    stock INT NOT NULL DEFAULT 1 CHECK (stock >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT '{}',                        -- 'Destacado', 'Rebaja', 'Tendencia', 'Oferta'
    images TEXT[] DEFAULT '{}',                      -- URLs de fotos en Storage
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: sales (Registro y Cobro de Ventas)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    product_sku TEXT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    unit_sale_price NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Efectivo', 'Transferencia', 'Tarjeta')),
    total_amount NUMERIC(10,2) NOT NULL,  -- unit_sale_price * quantity
    profit NUMERIC(10,2) NOT NULL,        -- (unit_sale_price - unit_cost) * quantity
    customer_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: expenses (Gastos Operativos para P&L)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Envíos', 'Empaques', 'Publicidad', 'Servicios', 'Otros')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON public.products(is_active, stock);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);

-- 6. TRIGGER: Actualización automática de updated_at en products
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. TRIGGER: Descuento automático de stock al registrar una venta
CREATE OR REPLACE FUNCTION public.handle_sale_stock_deduction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_id IS NOT NULL THEN
        UPDATE public.products
        SET stock = GREATEST(0, stock - NEW.quantity)
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sale_stock_deduction ON public.sales;
CREATE TRIGGER trigger_sale_stock_deduction
    AFTER INSERT ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sale_stock_deduction();

-- 8. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 8.1 Políticas para 'products':
-- Público general puede ver solo productos activos con stock disponible
DROP POLICY IF EXISTS "Public can view active in-stock products" ON public.products;
CREATE POLICY "Public can view active in-stock products"
    ON public.products
    FOR SELECT
    TO anon
    USING (is_active = true AND stock > 0);

-- Administradores autenticados pueden ver TODOS los productos (incluso agotados e inactivos)
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products"
    ON public.products
    FOR SELECT
    TO authenticated
    USING (true);

-- Administradores autenticados pueden insertar productos
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Administradores autenticados pueden actualizar productos
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Administradores autenticados pueden eliminar productos
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (true);

-- 8.2 Políticas para 'sales':
-- Solo administradores autenticados pueden consultar ventas
DROP POLICY IF EXISTS "Admins can view sales" ON public.sales;
CREATE POLICY "Admins can view sales"
    ON public.sales
    FOR SELECT
    TO authenticated
    USING (true);

-- Solo administradores autenticados pueden insertar ventas
DROP POLICY IF EXISTS "Admins can insert sales" ON public.sales;
CREATE POLICY "Admins can insert sales"
    ON public.sales
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Solo administradores autenticados pueden actualizar o eliminar ventas
DROP POLICY IF EXISTS "Admins can manage sales" ON public.sales;
CREATE POLICY "Admins can manage sales"
    ON public.sales
    FOR ALL
    TO authenticated
    USING (true);

-- 8.3 Políticas para 'expenses':
-- Solo administradores autenticados pueden gestionar gastos
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
CREATE POLICY "Admins can manage expenses"
    ON public.expenses
    FOR ALL
    TO authenticated
    USING (true);

-- 9. CONFIGURACIÓN DEL STORAGE BUCKET PARA IMÁGENES
-- Crear el bucket 'product-images' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de RLS en storage.objects para el bucket 'product-images'
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images');

-- ====================================================================
-- 10. DATOS SEMILLA (PRODUCTOS INICIALES DE EJEMPLO)
-- ====================================================================
INSERT INTO public.products (
    title, description, category, condition, sku, size, color, cost_price, sale_price, discount_price, stock, is_active, tags, images
) VALUES
(
    'Collar Cadena Eslabón Chapa de Oro 18k',
    'Hermosa cadenita de eslabones pulidos con baño de oro de 18 kilates. Hipoalergénica, acabado brillante de larga duración con dije de gota.',
    'joyeria',
    'Nuevo',
    'JOY-001',
    'Única (45cm)',
    'Dorado',
    180.00,
    450.00,
    380.00,
    8,
    true,
    ARRAY['Destacado', 'Rebaja'],
    ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80']
),
(
    'Aretes Huggies Circonias Champagne',
    'Arracadas pequeñas tipo huggies con incrustaciones de micro-circonias en tono champagne. Broche de seguridad estilo click.',
    'joyeria',
    'Nuevo',
    'JOY-002',
    'Única',
    'Oro Rosa',
    95.00,
    280.00,
    NULL,
    12,
    true,
    ARRAY['Destacado'],
    ARRAY['https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80']
),
(
    'Vestido Midi Lino & Algodón Terracota',
    'Vestido de corte campestre moderno con tirantes ajustables y cinturón de lazo. Tejido fresco con caída elegante.',
    'ropa',
    'Nuevo',
    'ROP-101',
    'M',
    'Terracota',
    340.00,
    799.00,
    NULL,
    4,
    true,
    ARRAY['Destacado'],
    ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80']
),
(
    'Blazer Estructurado Zara Colección Pasada',
    'Prenda Pre-Loved en estado impecable 10/10. Forro intacto, botones carey, hombreras sutiles que estilizan la figura.',
    'preloved',
    'Pre-loved',
    'PRE-201',
    'S',
    'Crema Marfil',
    220.00,
    550.00,
    490.00,
    1,
    true,
    ARRAY['Rebaja', 'Exclusivo'],
    ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80']
),
(
    'Falda Plisada Satín Esmeralda',
    'Falda de cintura elástica con brillo satinado de alta calidad. Prenda Outlet con 35% de descuento especial.',
    'outlet',
    'Nuevo',
    'OUT-301',
    'L',
    'Verde Esmeralda',
    190.00,
    620.00,
    399.00,
    3,
    true,
    ARRAY['Rebaja', 'Outlet'],
    ARRAY['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80']
),
(
    'Bolso Baguette Cuero Vegano Marfil',
    'Bolso de hombro estilo chic minimalista con herrajes dorados y cierre magnético suave.',
    'accesorios',
    'Nuevo',
    'ACC-401',
    'Mediano',
    'Marfil',
    280.00,
    680.00,
    NULL,
    5,
    true,
    ARRAY['Destacado'],
    ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80']
)
ON CONFLICT DO NOTHING;

-- Registro de ventas iniciales para métricas y P&L
INSERT INTO public.sales (
    product_title, product_sku, quantity, unit_cost, unit_sale_price, payment_method, total_amount, profit, customer_name, notes, created_at
) VALUES
('Collar Cadena Eslabón Chapa de Oro 18k', 'JOY-001', 2, 180.00, 380.00, 'Transferencia', 760.00, 400.00, 'Valeria Morales', 'Apartado por WhatsApp', now() - INTERVAL '2 days'),
('Vestido Midi Lino & Algodón Terracota', 'ROP-101', 1, 340.00, 799.00, 'Efectivo', 799.00, 459.00, 'Camila Soto', 'Venta en tienda física', now() - INTERVAL '1 day'),
('Aretes Huggies Circonias Champagne', 'JOY-002', 3, 95.00, 280.00, 'Tarjeta', 840.00, 555.00, 'Sofía Reyes', 'Pedido express WhatsApp', now() - INTERVAL '5 hours')
ON CONFLICT DO NOTHING;

-- Registro de gastos operativos para P&L
INSERT INTO public.expenses (
    concept, amount, category, date, notes
) VALUES
('Bolsitas de tela y papel seda para empaque boutique', 350.00, 'Empaques', CURRENT_DATE - 3, 'Insumos para presentación'),
('Pauta publicitaria en Instagram Reels', 400.00, 'Publicidad', CURRENT_DATE - 2, 'Campaña día de las madres / verano'),
('Envío local mensajería en moto', 120.00, 'Envíos', CURRENT_DATE - 1, 'Entrega a domicilio cliente')
ON CONFLICT DO NOTHING;
