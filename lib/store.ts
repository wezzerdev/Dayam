import { Product, Sale, Expense, FinancialSummary } from "./types";
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES } from "./demo-data";
import { createClient, isSupabaseConfigured } from "./supabase/client";

const STORAGE_KEYS = {
  PRODUCTS: "boutique_dayam_products",
  SALES: "boutique_dayam_sales",
  EXPENSES: "boutique_dayam_expenses",
};

// Helper para obtener datos sincronizados de localStorage en el navegador
function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error guardando en localStorage:", err);
  }
}

// -------------------------------------------------------------------------
// PRODUCTOS
// -------------------------------------------------------------------------
export async function getProducts(onlyActive: boolean = false): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (onlyActive) {
        query = query.eq("is_active", true).gt("stock", 0);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Product[];
      }
    } catch (e) {
      console.warn("Supabase no disponible, usando almacén local:", e);
    }
  }

  // Fallback Local Storage
  const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (onlyActive) {
    return list.filter((p) => p.is_active && p.stock > 0);
  }
  return list;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (!error && data) return data as Product;
    } catch {}
  }
  const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  return list.find((p) => p.id === id) || null;
}

export async function saveProduct(product: Partial<Product> & { title: string; sale_price: number }): Promise<Product> {
  const isEditing = Boolean(product.id);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (isEditing) {
        const { data, error } = await supabase
          .from("products")
          .update(product)
          .eq("id", product.id!)
          .select()
          .single();
        if (!error && data) return data as Product;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([product])
          .select()
          .single();
        if (!error && data) return data as Product;
      }
    } catch (e) {
      console.warn("Error en Supabase saveProduct, fallback a local:", e);
    }
  }

  // Fallback Local
  const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (isEditing) {
    const updated = list.map((p) => (p.id === product.id ? ({ ...p, ...product, updated_at: new Date().toISOString() } as Product) : p));
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return updated.find((p) => p.id === product.id)!;
  } else {
    const newProduct: Product = {
      id: "prod-" + Date.now(),
      title: product.title,
      description: product.description || "",
      category: product.category || "ropa",
      condition: product.condition || "Nuevo",
      sku: product.sku || `SKU-${Date.now().toString().slice(-4)}`,
      size: product.size || "Única",
      color: product.color || "",
      cost_price: Number(product.cost_price || 0),
      sale_price: Number(product.sale_price || 0),
      discount_price: product.discount_price ? Number(product.discount_price) : undefined,
      stock: Number(product.stock ?? 1),
      is_active: product.is_active ?? true,
      tags: product.tags || [],
      images: product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"],
      created_at: new Date().toISOString(),
    };
    const updated = [newProduct, ...list];
    setLocal(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) return true;
    } catch {}
  }
  const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = list.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PRODUCTS, updated);
  return true;
}

// -------------------------------------------------------------------------
// VENTAS (REGISTRO Y COBRO)
// -------------------------------------------------------------------------
export async function getSales(): Promise<Sale[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("sales").select("*").order("created_at", { ascending: false });
      if (!error && data) return data as Sale[];
    } catch {}
  }
  return getLocal<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
}

export async function registerSale(params: {
  product_id?: string;
  product_title: string;
  product_sku?: string;
  quantity: number;
  unit_cost: number;
  unit_sale_price: number;
  payment_method: "Efectivo" | "Transferencia" | "Tarjeta";
  customer_name?: string;
  notes?: string;
}): Promise<Sale> {
  const total_amount = params.quantity * params.unit_sale_price;
  const total_cost = params.quantity * params.unit_cost;
  const profit = total_amount - total_cost;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sales")
        .insert([
          {
            product_id: params.product_id,
            product_title: params.product_title,
            product_sku: params.product_sku,
            quantity: params.quantity,
            unit_cost: params.unit_cost,
            unit_sale_price: params.unit_sale_price,
            payment_method: params.payment_method,
            total_amount,
            profit,
            customer_name: params.customer_name,
            notes: params.notes,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        // En supabase el trigger handle_sale_stock_deduction se encarga del stock
        return data as Sale;
      }
    } catch (e) {
      console.warn("Error en Supabase registerSale, fallback local:", e);
    }
  }

  // Fallback Local
  const sales = getLocal<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  const newSale: Sale = {
    id: "sale-" + Date.now(),
    product_id: params.product_id,
    product_title: params.product_title,
    product_sku: params.product_sku,
    quantity: params.quantity,
    unit_cost: params.unit_cost,
    unit_sale_price: params.unit_sale_price,
    payment_method: params.payment_method,
    total_amount,
    profit,
    customer_name: params.customer_name,
    notes: params.notes,
    created_at: new Date().toISOString(),
  };

  // Descontar stock localmente
  if (params.product_id) {
    const products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const updatedProducts = products.map((p) => {
      if (p.id === params.product_id) {
        const remainingStock = Math.max(0, p.stock - params.quantity);
        return {
          ...p,
          stock: remainingStock,
          is_active: remainingStock > 0 ? p.is_active : false,
        };
      }
      return p;
    });
    setLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);
  }

  setLocal(STORAGE_KEYS.SALES, [newSale, ...sales]);
  return newSale;
}

// -------------------------------------------------------------------------
// GASTOS OPERATIVOS
// -------------------------------------------------------------------------
export async function getExpenses(): Promise<Expense[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false });
      if (!error && data) return data as Expense[];
    } catch {}
  }
  return getLocal<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
}

export async function addExpense(expense: Omit<Expense, "id" | "created_at">): Promise<Expense> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("expenses").insert([expense]).select().single();
      if (!error && data) return data as Expense;
    } catch {}
  }

  const expenses = getLocal<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  const newExp: Expense = {
    id: "exp-" + Date.now(),
    ...expense,
    created_at: new Date().toISOString(),
  };
  setLocal(STORAGE_KEYS.EXPENSES, [newExp, ...expenses]);
  return newExp;
}

export async function deleteExpense(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (!error) return true;
    } catch {}
  }
  const expenses = getLocal<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  setLocal(STORAGE_KEYS.EXPENSES, expenses.filter((e) => e.id !== id));
  return true;
}

// -------------------------------------------------------------------------
// CÁLCULO FINANCIERO: P&L Y BALANCE GENERAL
// -------------------------------------------------------------------------
export async function getFinancialSummary(period: "all" | "today" | "month" | "year" = "all"): Promise<FinancialSummary> {
  const [products, allSales, allExpenses] = await Promise.all([
    getProducts(false),
    getSales(),
    getExpenses(),
  ]);

  const now = new Date();
  const filterByDate = (dateStr: string) => {
    if (period === "all") return true;
    const d = new Date(dateStr);
    if (period === "today") {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
    if (period === "month") {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }
    if (period === "year") {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredSales = allSales.filter((s) => filterByDate(s.created_at));
  const filteredExpenses = allExpenses.filter((e) => filterByDate(e.date || e.created_at));

  // Métricas P&L
  const gross_sales = filteredSales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const cost_of_goods_sold = filteredSales.reduce((acc, s) => acc + Number(s.unit_cost || 0) * Number(s.quantity || 1), 0);
  const gross_profit = gross_sales - cost_of_goods_sold;
  const operating_expenses = filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const net_profit = gross_profit - operating_expenses;
  const profit_margin_pct = gross_sales > 0 ? (net_profit / gross_sales) * 100 : 0;

  // Balance General & Activos
  // Efectivo disponible estimado = Ingresos cobrados acumulados - Gastos totales
  const totalAllSales = allSales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const totalAllExpenses = allExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const cash_available = Math.max(0, totalAllSales - totalAllExpenses);

  // Valoración del inventario actual
  const inventory_cost_value = products.reduce((acc, p) => acc + Number(p.cost_price || 0) * Math.max(0, p.stock), 0);
  const inventory_retail_value = products.reduce((acc, p) => acc + Number(p.sale_price || 0) * Math.max(0, p.stock), 0);
  const total_current_assets = cash_available + inventory_cost_value;

  const total_items_sold = filteredSales.reduce((acc, s) => acc + Number(s.quantity || 1), 0);
  const total_items_in_stock = products.reduce((acc, p) => acc + Math.max(0, p.stock), 0);

  return {
    gross_sales,
    cost_of_goods_sold,
    gross_profit,
    operating_expenses,
    net_profit,
    profit_margin_pct,
    cash_available,
    inventory_cost_value,
    inventory_retail_value,
    total_current_assets,
    total_items_sold,
    total_items_in_stock,
    total_products_count: products.length,
  };
}

// -------------------------------------------------------------------------
// SUBIDA DE IMÁGENES A SUPABASE STORAGE
// -------------------------------------------------------------------------
export async function uploadProductImage(fileBlob: Blob, filename?: string): Promise<string> {
  const name = filename || `boutique_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(name, fileBlob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(name);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn("Error subiendo a Supabase Storage, usando data URL:", err);
    }
  }

  // Fallback: convertir Blob a Data URL Base64 para almacenamiento autónomo
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(fileBlob);
  });
}
