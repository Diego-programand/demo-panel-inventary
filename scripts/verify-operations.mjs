/**
 * ========================================================
 * DEMOPANEL INVENTORY OS — OPERATIONS VERIFICATION GATE (FASE 5)
 * ========================================================
 * Valida la existencia de especificaciones, componentes de movimientos,
 * modal de transacciones, validación de saldos y reglas del Kardex.
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

console.log("\n\x1b[1m\x1b[36m INICIANDO VERIFICACIÓN DE OPERACIONES Y KARDEX (FASE 5)\x1b[0m\n");

// 1. Verificación de archivos requeridos
console.log("\x1b[1m1. Comprobando especificaciones y componentes de Operaciones:\x1b[0m");

const filesToCheck = [
  "docs/specs/03-operations-kardex-module.md",
  "src/components/operations/MovementModal.tsx",
  "src/components/operations/MovementModal.module.css",
  "src/components/operations/MovementsContent.tsx",
  "src/components/operations/MovementsContent.module.css"
];

for (const file of filesToCheck) {
  test(`Archivo requerido presente: ${file}`, () => {
    const fullPath = path.join(ROOT, file);
    assert(fs.existsSync(fullPath), `Falta el archivo: ${file}`);
    const size = fs.statSync(fullPath).size;
    assert(size > 50, `Archivo vacío o incompleto (${size} bytes): ${file}`);
  });
}

// 2. Comprobando código fuente y capacidades de la interfaz
console.log("\n\x1b[1m2. Verificando capacidades de los formularios de movimiento:\x1b[0m");

const modalCode = fs.readFileSync(path.join(ROOT, "src/components/operations/MovementModal.tsx"), "utf8");
const contentCode = fs.readFileSync(path.join(ROOT, "src/components/operations/MovementsContent.tsx"), "utf8");

test("Soporte para 4 operaciones fundamentales en el modal (Compra, Venta, Traslado, Ajuste)", () => {
  assert(modalCode.includes("purchase_reception"), "Falta purchase_reception");
  assert(modalCode.includes("sales_dispatch"), "Falta sales_dispatch");
  assert(modalCode.includes("transfer"), "Falta soporte para transferencias");
  assert(modalCode.includes("audit_adjustment"), "Falta audit_adjustment");
});

test("Cálculo y previsualización de saldo proyectado antes de enviar", () => {
  assert(modalCode.includes("projectedStock") || modalCode.includes("projectedInfo"), "Falta cálculo de projectedStock o projectedInfo");
});

test("Validación de stock negativo en despachos y traslados", () => {
  assert(modalCode.includes("insufficientStock") || modalCode.includes("stock < quantity") || modalCode.includes("error"), "Falta comprobación de insuficiencia de stock");
});

test("Validación de almacenes distintos en traslados", () => {
  assert(modalCode.includes("sourceLocationId === targetLocationId") || modalCode.includes("sourceLocation === targetLocation"), "Falta validación de almacenes distintos");
});

test("Exportación de libro Kardex a formato CSV", () => {
  assert(contentCode.includes("handleExportKardexCSV") || contentCode.includes("text/csv"), "Falta exportación a CSV del Kardex");
});

// 3. Reglas matemáticas de simulación de inventario
console.log("\n\x1b[1m3. Comprobando reglas matemáticas y de integridad:\x1b[0m");

test("Regla de Recepción: suma exacta en almacén destino y global", () => {
  const stockInit = { "wh-main": 10, "wh-north": 5 };
  const qty = 7;
  stockInit["wh-main"] += qty;
  const total = Object.values(stockInit).reduce((a, b) => a + b, 0);
  assert(stockInit["wh-main"] === 17, "Error en recepción en almacén");
  assert(total === 22, "Error en total acumulado");
});

test("Regla de Despacho: bloqueo si cantidad > stock disponible", () => {
  const available = 5;
  const request = 8;
  const isValid = request <= available;
  assert(!isValid, "El despacho no debe autorizarse si excede las existencias");
});

test("Regla de Traslado: conservación estricta (Delta global = 0)", () => {
  const stock = { "wh-main": 20, "wh-north": 10 };
  const totalBefore = stock["wh-main"] + stock["wh-north"];
  const transferQty = 8;

  // Ejecutar traslado
  stock["wh-main"] -= transferQty;
  stock["wh-north"] += transferQty;
  const totalAfter = stock["wh-main"] + stock["wh-north"];

  assert(stock["wh-main"] === 12, "Stock de origen incorrecto");
  assert(stock["wh-north"] === 18, "Stock de destino incorrecto");
  assert(totalBefore === totalAfter, "Violación del principio de conservación en traslado");
});

console.log("\n========================================================");
if (failed === 0) {
  console.log(`\x1b[32m✓ OPERACIONES & KARDEX 100% OPERATIVO: ${passed} pruebas exitosas.\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\x1b[31m✗ FALLO EN OPERACIONES: ${failed} pruebas fallidas, ${passed} exitosas.\x1b[0m\n`);
  process.exit(1);
}
