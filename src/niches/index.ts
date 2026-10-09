import { NicheProfile, NicheId } from "@/core/types/niche";

export const RETAIL_FASHION_NICHE: NicheProfile = {
  id: "retail_fashion",
  name: "Moda & Retail",
  tagline: "Control de prendas por variantes de talla, color y colecciones de temporada.",
  icon: "tshirt",
  accentColor: "var(--apple-indigo)",
  vocabulary: {
    itemSingular: "Prenda",
    itemPlural: "Prendas",
    categoryLabel: "Colección",
    locationLabel: "Tienda / Bodega",
    unitDefault: "pz",
  },
  customFields: [
    { key: "size", label: "Talla", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL"], required: true },
    { key: "color", label: "Color", type: "text", placeholder: "ej. Azul Marino", required: true },
    { key: "season", label: "Temporada", type: "text", placeholder: "ej. Otoño - Invierno 2026" },
    { key: "material", label: "Composición", type: "text", placeholder: "ej. 100% Algodón Pima" },
  ],
  sampleCategories: ["Abrigos & Chaquetas", "Camisería", "Calzado", "Accesorios", "Pantalones"],
};

export const PHARMA_HEALTH_NICHE: NicheProfile = {
  id: "pharma_health",
  name: "Salud & Farmacéutica",
  tagline: "Trazabilidad rigurosa por lotes, fechas de vencimiento y cadena de frío.",
  icon: "cross.case",
  accentColor: "var(--apple-teal)",
  vocabulary: {
    itemSingular: "Medicamento / Insumo",
    itemPlural: "Medicamentos",
    categoryLabel: "Familia Terapéutica",
    locationLabel: "Farmacia / Depósito",
    unitDefault: "caja",
  },
  customFields: [
    { key: "batchNumber", label: "Número de Lote", type: "text", placeholder: "LT-2026-99", required: true },
    { key: "expiryDate", label: "Fecha de Vencimiento", type: "date", required: true },
    { key: "requiresColdChain", label: "Cadena de Frío (2°C - 8°C)", type: "boolean" },
    { key: "healthRegistry", label: "Registro Sanitario", type: "text", placeholder: "INVIMA-M-00892" },
  ],
  sampleCategories: ["Antibióticos", "Analgésicos", "Insumos Quirúrgicos", "Vacunas", "Nutrición Especializada"],
};

export const TECH_ELECTRONICS_NICHE: NicheProfile = {
  id: "tech_electronics",
  name: "Tecnología & Hardware",
  tagline: "Gestión de activos de alto valor con números de serie únicos y garantías.",
  icon: "cpu",
  accentColor: "var(--apple-blue)",
  vocabulary: {
    itemSingular: "Dispositivo / Pieza",
    itemPlural: "Dispositivos",
    categoryLabel: "Línea de Hardware",
    locationLabel: "Almacén Central / Lab",
    unitDefault: "unidad",
  },
  customFields: [
    { key: "serialNumber", label: "N° de Serie Principal", type: "text", placeholder: "SN-89410928" },
    { key: "warrantyMonths", label: "Garantía (Meses)", type: "number", placeholder: "12" },
    { key: "modelNumber", label: "Modelo / Part Number", type: "text", placeholder: "MD-A2890" },
  ],
  sampleCategories: ["Laptops & Servidores", "Componentes & Memorias", "Periféricos Pro", "Audio & Óptica", "Redes & Conectividad"],
};

export const FOOD_BEVERAGE_NICHE: NicheProfile = {
  id: "food_beverage",
  name: "Alimentos & HORECA",
  tagline: "Control de materias primas perecederas, mermas y rotación FIFO/FEFO.",
  icon: "fork.knife",
  accentColor: "var(--apple-orange)",
  vocabulary: {
    itemSingular: "Insumo",
    itemPlural: "Insumos",
    categoryLabel: "Tipo de Insumo",
    locationLabel: "Cámara / Bodega Seca",
    unitDefault: "kg",
  },
  customFields: [
    { key: "storageCondition", label: "Almacenamiento", type: "select", options: ["Ambiente Seco", "Refrigerado (0-4°C)", "Congelado (-18°C)"] },
    { key: "shelfLifeDays", label: "Vida Útil (Días)", type: "number", placeholder: "15" },
    { key: "perishable", label: "Es Perecedero", type: "boolean" },
  ],
  sampleCategories: ["Cárnicos & Aves", "Lácteos & Quesos", "Vegetales Frescos", "Granos & Abarrotes", "Bebidas & Licores"],
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
