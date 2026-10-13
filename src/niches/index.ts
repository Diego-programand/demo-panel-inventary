import { NicheProfile, NicheId } from "@/core/types/niche";

export const RETAIL_FASHION_NICHE: NicheProfile = {
  id: "retail_fashion",
  name: "Moda & Ropa",
  tagline: "Organiza tus prendas por tallas, colores y existencias en cada tienda.",
  icon: "tshirt",
  accentColor: "var(--apple-indigo)",
  vocabulary: {
    itemSingular: "Prenda",
    itemPlural: "Prendas",
    categoryLabel: "Categoría",
    locationLabel: "Tienda / Bodega",
    unitDefault: "pz",
  },
  customFields: [
    { key: "size", label: "Talla", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL"], required: true },
    { key: "color", label: "Color", type: "text", placeholder: "ej. Azul Marino", required: true },
    { key: "season", label: "Temporada", type: "text", placeholder: "ej. Colección Actual" },
    { key: "material", label: "Material", type: "text", placeholder: "ej. 100% Algodón" },
  ],
  sampleCategories: ["Chaquetas", "Camisas", "Pantalones", "Vestidos", "Calzado"],
};

export const PHARMA_HEALTH_NICHE: NicheProfile = {
  id: "pharma_health",
  name: "Salud & Farmacia",
  tagline: "Control fácil de medicamentos, fechas de vencimiento y existencias disponibles.",
  icon: "cross.case",
  accentColor: "var(--apple-teal)",
  vocabulary: {
    itemSingular: "Medicamento",
    itemPlural: "Medicamentos",
    categoryLabel: "Categoría",
    locationLabel: "Farmacia / Bodega",
    unitDefault: "caja",
  },
  customFields: [
    { key: "batchNumber", label: "Número de Lote", type: "text", placeholder: "LT-2026-01", required: true },
    { key: "expiryDate", label: "Fecha de Vencimiento", type: "date", required: true },
    { key: "requiresColdChain", label: "Requiere Refrigeración", type: "boolean" },
    { key: "healthRegistry", label: "Registro Sanitario", type: "text", placeholder: "REG-2026-01" },
  ],
  sampleCategories: ["Medicamentos Comunes", "Cuidado Personal", "Primeros Auxilios", "Suplementos"],
};

export const TECH_ELECTRONICS_NICHE: NicheProfile = {
  id: "tech_electronics",
  name: "Tecnología & Gadgets",
  tagline: "Gestión de dispositivos, accesorios y garantías por número de serie.",
  icon: "cpu",
  accentColor: "var(--apple-blue)",
  vocabulary: {
    itemSingular: "Dispositivo",
    itemPlural: "Dispositivos",
    categoryLabel: "Categoría",
    locationLabel: "Tienda / Bodega",
    unitDefault: "unidad",
  },
  customFields: [
    { key: "serialNumber", label: "N° de Serie", type: "text", placeholder: "SN-2026-001" },
    { key: "warrantyMonths", label: "Garantía (Meses)", type: "number", placeholder: "12" },
    { key: "modelNumber", label: "Modelo", type: "text", placeholder: "MOD-X1" },
  ],
  sampleCategories: ["Audio & Audífonos", "Cargadores & Cables", "Accesorios PC", "Gadgets Móviles"],
};

export const FOOD_BEVERAGE_NICHE: NicheProfile = {
  id: "food_beverage",
  name: "Alimentos & Cafetería",
  tagline: "Control sencillo de ingredientes, bebidas y fechas de vencimiento.",
  icon: "fork.knife",
  accentColor: "var(--apple-orange)",
  vocabulary: {
    itemSingular: "Ingrediente / Producto",
    itemPlural: "Ingredientes",
    categoryLabel: "Categoría",
    locationLabel: "Cocina / Bodega",
    unitDefault: "kg",
  },
  customFields: [
    { key: "storageCondition", label: "Almacenamiento", type: "select", options: ["Ambiente Seco", "Refrigerado (0-4°C)", "Congelado (-18°C)"] },
    { key: "shelfLifeDays", label: "Días de Vida Útil", type: "number", placeholder: "15" },
    { key: "perishable", label: "Es Perecedero", type: "boolean" },
  ],
  sampleCategories: ["Café & Bebidas", "Lácteos & Quesos", "Abarrotes & Aceites", "Carnes & Aves"],
};

export const NICHE_PROFILES: Record<NicheId, NicheProfile> = {
  retail_fashion: RETAIL_FASHION_NICHE,
  pharma_health: PHARMA_HEALTH_NICHE,
  tech_electronics: TECH_ELECTRONICS_NICHE,
  food_beverage: FOOD_BEVERAGE_NICHE,
};

export function getNicheProfile(nicheId: NicheId): NicheProfile {
  return NICHE_PROFILES[nicheId] || RETAIL_FASHION_NICHE;
}
