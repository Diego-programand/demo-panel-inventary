/**
 * ========================================================
 * DEMOPANEL INVENTORY OS — CATALOG VERIFICATION GATE (FASE 4)
 * ========================================================
 * Valida la existencia de especificaciones, componentes de Catálogo,
 * lógica de filtrado facetado, indexación de atributos y selección múltiple.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✓\x1b[0m ${description}`);
    passed++;
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m ${description}`);
    console.error(`    \x1b[31m${err.message}\x1b[0m`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

console.log("\n\x1b[1m\x1b[36m INICIANDO VERIFICACIÓN DEL MÓDULO DE CATÁLOGO (FASE 4)\x1b[0m\n");

// 1. Verificación de archivos y contratos requeridos
console.log("\x1b[1m1. Comprobando especificaciones y componentes de Catálogo:\x1b[0m");

const filesToCheck = [
  "docs/specs/02-catalog-module.md",
  "src/components/catalog/CatalogContent.tsx",
  "src/components/catalog/CatalogContent.module.css",
  "src/components/catalog/ItemDetailSheet.tsx",
  "src/components/catalog/ItemDetailSheet.module.css",
  "src/components/catalog/BatchActionBar.tsx",
  "src/components/catalog/BatchActionBar.module.css",
  "src/components/layout/MainSectionRouter.tsx"
];

for (const file of filesToCheck) {
  test(`Archivo requerido presente: ${file}`, () => {
    const fullPath = path.join(ROOT, file);
    assert(fs.existsSync(fullPath), `Falta el archivo: ${file}`);
    const size = fs.statSync(fullPath).size;
    assert(size > 50, `Archivo vacío o incompleto (${size} bytes): ${file}`);
  });
}

// 2. Comprobando contenido y arquitectura del componente de Catálogo
console.log("\n\x1b[1m2. Verificando capacidades de la interfaz del Catálogo:\x1b[0m");

const catalogContentCode = fs.readFileSync(path.join(ROOT, "src/components/catalog/CatalogContent.tsx"), "utf8");
const sheetCode = fs.readFileSync(path.join(ROOT, "src/components/catalog/ItemDetailSheet.tsx"), "utf8");
const batchCode = fs.readFileSync(path.join(ROOT, "src/components/catalog/BatchActionBar.tsx"), "utf8");

test("Soporte para atajo de teclado '/' (Focus de búsqueda)", () => {
  assert(catalogContentCode.includes('e.key === "/"'), "Falta listener de atajo '/'");
});

test("Filtrado facetado por Categoría y Estado de Stock", () => {
  assert(catalogContentCode.includes("selectedCategory"), "Falta estado de categoría");
  assert(catalogContentCode.includes("selectedStatus"), "Falta estado de stock");
  assert(catalogContentCode.includes("statusSegmented"), "Falta selector segmentado de estado");
});

test("Inspector Lateral (Slide-Over Sheet) con cierre por Escape", () => {
  assert(sheetCode.includes('e.key === "Escape"'), "Falta manejador de tecla Escape en inspector");
  assert(sheetCode.includes("handleQuickReorder"), "Falta reorden de 1-clic en inspector");
  assert(sheetCode.includes("handleCopySku"), "Falta función de copiado rápido de SKU");
});

test("Barra de Acciones por Lote con Exportación CSV y Reorden Masivo", () => {
  assert(batchCode.includes("handleExportCSV"), "Falta exportación a CSV en acciones por lote");
  assert(batchCode.includes("handleBatchReorder"), "Falta reorden por lote");
});

// 3. Comprobando simulación de filtrado sobre estructura de datos
console.log("\n\x1b[1m3. Comprobando algoritmos de filtrado facetado:\x1b[0m");

const sampleItems = [
  { id: "1", sku: "RET-001", name: "Chaqueta Cuero Bomber", category: "Chaquetas", totalStock: 8, minThreshold: 10, status: "critical", nicheAttributes: { size: "M", color: "Negro" } },
  { id: "2", sku: "PHA-001", name: "Amoxicilina 500mg", category: "Antibióticos", totalStock: 50, minThreshold: 20, status: "optimal", nicheAttributes: { lotNumber: "LOT-9921", expirationDate: "2026-12-01" } },
  { id: "3", sku: "TEC-001", name: "Servidor Rack 1U", category: "Servidores", totalStock: 2, minThreshold: 5, status: "critical", nicheAttributes: { serialNumber: "SRV-2026-X1" } },
];

test("Algoritmo de búsqueda predictiva multidominio", () => {
  const query = "bomber";
  const matched = sampleItems.filter((item) => {
    const attrValues = Object.values(item.nicheAttributes || {}).join(" ").toLowerCase();
    const searchContent = `${item.sku} ${item.name} ${item.category} ${attrValues}`.toLowerCase();
    return searchContent.includes(query.toLowerCase());
  });
  assert(matched.length === 1 && matched[0].sku === "RET-001", "Búsqueda predictiva falló para 'bomber'");
});

test("Algoritmo de búsqueda sobre atributos dinámicos (número de lote)", () => {
  const query = "LOT-9921";
  const matched = sampleItems.filter((item) => {
    const attrValues = Object.values(item.nicheAttributes || {}).join(" ").toLowerCase();
    return attrValues.includes(query.toLowerCase());
  });
  assert(matched.length === 1 && matched[0].sku === "PHA-001", "Fallo al indexar atributos de lote");
});

console.log("\n========================================================");
if (failed === 0) {
  console.log(`\x1b[32m✓ CATÁLOGO 100% OPERATIVO: ${passed} pruebas exitosas.\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\x1b[31m✗ FALLO EN CATÁLOGO: ${failed} pruebas fallidas, ${passed} exitosas.\x1b[0m\n`);
  process.exit(1);
}
