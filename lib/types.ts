export type ProductCategory = 
  | 'joyeria' 
  | 'ropa' 
  | 'preloved' 
  | 'outlet' 
  | 'accesorios';

export type ProductCondition = 'Nuevo' | 'Pre-loved';

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta';

export type ExpenseCategory = 'Envíos' | 'Empaques' | 'Publicidad' | 'Servicios' | 'Otros';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  condition: ProductCondition;
  sku: string;
  size?: string;
  color?: string;
  cost_price: number;       // Costo de Adquisición (CMV)
  sale_price: number;       // Precio Regular de Venta
  discount_price?: number;  // Precio de Rebaja / Outlet
  stock: number;
  is_active: boolean;
  tags: string[];
  images: string[];
  created_at: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  product_id?: string;
  product_title: string;
  product_sku?: string;
  quantity: number;
  unit_cost: number;
  unit_sale_price: number;
  payment_method: PaymentMethod;
  total_amount: number;
  profit: number;
  customer_name?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  concept: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  created_at: string;
}

export interface FinancialSummary {
  // P&L
  gross_sales: number;        // Ingresos totales por ventas
  cost_of_goods_sold: number; // Costo de Mercancías Vendidas (CMV)
  gross_profit: number;       // Utilidad Bruta = Ingresos - CMV
  operating_expenses: number; // Gastos operativos
  net_profit: number;         // Utilidad Neta = Utilidad Bruta - Gastos
  profit_margin_pct: number;  // Margen %

  // Balance General / Activos
  cash_available: number;     // Efectivo en caja/banco (Ventas cobradas - Gastos)
  inventory_cost_value: number; // Valor actual del inventario a costo de compra
  inventory_retail_value: number; // Valor del inventario a precio de venta
  total_current_assets: number; // Activo Circulante = Efectivo + Inventario a costo

  // Operaciones
  total_items_sold: number;
  total_items_in_stock: number;
  total_products_count: number;
}
