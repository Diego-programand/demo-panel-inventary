/**
 * ========================================================
 * DEMOPANEL INVENTORY OS — HARNESS VERIFICATION GATE
 * ========================================================
 * Verifica la integridad del arnés de ingeniería, contratos
 * documentales, skills requeridas, seguridad y enlaces.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

let errors = [];
let warnings = [];
let passedChecks = 0;

function pass(msg) {
  passedChecks++;
  console.log(`  \x1b[32m✓\x1b[0m ${msg}`);
}

function fail(msg) {
  errors.push(msg);
  console.log(`  \x1b[31m✗\x1b[0m ${msg}`);
}

function warn(msg) {
  warnings.push(msg);
  console.log(`  \x1b[33m!\x1b[0m ${msg}`);
}

console.log("\n\x1b[1m\x1b[36m INICIANDO COMPROBACIÓN DEL ARNÉS DE INGENIERÍA\x1b[0m\n");

// 1. Verificación de Contratos Documentales
const requiredDocs = [
  "AGENTS.md",
  "GEMINI.md",
  "README.md",
  "docs/architecture/00-harness-manifesto.md",
  "docs/architecture/01-multi-niche-data-model.md",
  "docs/design-system/apple-hig-tokens.md",
  "docs/roadmap/phased-execution-plan.md",
  "docs/specs/01-overview-dashboard.md",
  "docs/specs/02-catalog-module.md",
  "docs/specs/03-operations-kardex-module.md",
  "docs/specs/04-vercel-deployment-guide.md"
];


for (const doc of requiredDocs) {
  const fullPath = path.join(ROOT, doc);
  if (!fs.existsSync(fullPath)) {
    fail(`Falta el documento requerido: ${doc}`);
  } else {
    const stats = fs.statSync(fullPath);
    if (stats.size < 50) {
      fail(`El documento está vacío o incompleto (<50 bytes): ${doc}`);
    } else {
      pass(`Contrato intacto: ${doc} (${stats.size} bytes)`);
    }
  }
}

// 2. Verificación de Skills del Arnés
console.log("\n\x1b[1m2. Verificando Skills del Workspace (.agents/skills/):\x1b[0m");
const requiredSkills = [
  "the-architect",
  "apple-design",
  "react-best-practices",
  "composition-patterns",
  "web-design-guidelines",
  "deploy-to-vercel",
  "vercel-optimize",
  "react-view-transitions"
];

for (const skill of requiredSkills) {
  const skillFile = path.join(ROOT, ".agents", "skills", skill, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    fail(`Falta SKILL.md para la habilidad: ${skill}`);
  } else {
    const content = fs.readFileSync(skillFile, "utf8");
    if (!content.startsWith("---")) {
      warn(`Skill sin YAML frontmatter estándar: ${skill}`);
    } else {
      pass(`Skill activa y validada: ${skill}`);
    }
  }
}

// 3. Verificación de Seguridad en .gitignore
console.log("\n\x1b[1m3. Verificando Blindaje de Seguridad (.gitignore):\x1b[0m");
const gitignorePath = path.join(ROOT, ".gitignore");
if (!fs.existsSync(gitignorePath)) {
  fail("No existe archivo .gitignore");
} else {
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
  const criticalPatterns = [".env", "node_modules", ".next", "*.pem", "*.key", "credentials.json"];
  for (const pattern of criticalPatterns) {
    if (gitignoreContent.includes(pattern)) {
      pass(`Patrón de seguridad presente: ${pattern}`);
    } else {
      fail(`Falta regla de seguridad en .gitignore: ${pattern}`);
    }
  }
}

// 4. Verificación de Dominio Núcleo y Perfiles Multi-Nicho
console.log("\n\x1b[1m4. Verificando Dominio de Inventario y Nichos:\x1b[0m");
const requiredDomainFiles = [
  "src/core/types/inventory.ts",
  "src/core/types/niche.ts",
  "src/niches/index.ts",
  "src/core/data/mock-datasets.ts",
  "src/core/store/inventory-store.tsx",
  "src/styles/tokens.css",
  "src/styles/globals.css",
  "vercel.json"
];

for (const df of requiredDomainFiles) {
  const fullPath = path.join(ROOT, df);
  if (!fs.existsSync(fullPath)) {
    fail(`Archivo de dominio ausente: ${df}`);
  } else {
    pass(`Módulo de arquitectura presente: ${df}`);
  }
}

// Comprobar los 4 nichos definidos en src/niches/index.ts
const nichesFile = path.join(ROOT, "src/niches/index.ts");
if (fs.existsSync(nichesFile)) {
  const content = fs.readFileSync(nichesFile, "utf8");
  const expectedNiches = ["retail_fashion", "pharma_health", "tech_electronics", "food_beverage"];
  for (const niche of expectedNiches) {
    if (content.includes(niche)) {
      pass(`Perfil de nicho configurado: ${niche}`);
    } else {
      fail(`Falta la definición del nicho: ${niche} en src/niches/index.ts`);
    }
  }
}

// 5. Verificación de Enlaces Relativos en Documentación
console.log("\n\x1b[1m5. Verificando Integridad de Enlaces en Documentación:\x1b[0m");
const markdownFiles = [
  path.join(ROOT, "README.md"),
  path.join(ROOT, "AGENTS.md"),
  path.join(ROOT, "GEMINI.md"),
  ...fs.readdirSync(path.join(ROOT, "docs/architecture")).map(f => path.join(ROOT, "docs/architecture", f)),
  ...fs.readdirSync(path.join(ROOT, "docs/design-system")).map(f => path.join(ROOT, "docs/design-system", f)),
  ...fs.readdirSync(path.join(ROOT, "docs/roadmap")).map(f => path.join(ROOT, "docs/roadmap", f)),
];

let checkedLinks = 0;
let brokenLinks = 0;

for (const file of markdownFiles) {
  if (!fs.existsSync(file) || !file.endsWith(".md")) continue;
  const content = fs.readFileSync(file, "utf8");
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const rawLink = match[2];
    // Ignorar urls externas http/https o anclas #
    if (rawLink.startsWith("http://") || rawLink.startsWith("https://") || rawLink.startsWith("#") || rawLink.startsWith("mailto:")) {
      continue;
    }
    
    // Normalizar enlaces file:/// o rutas relativas
    let targetPath = rawLink;
    if (targetPath.startsWith("file:///")) {
      targetPath = targetPath.replace("file:///", "");
      // Windows drive letter normalization
      if (/^[a-zA-Z]:/.test(targetPath)) {
        targetPath = path.normalize(targetPath);
      } else {
        targetPath = path.resolve(ROOT, targetPath);
      }
    } else {
      targetPath = path.resolve(path.dirname(file), targetPath);
    }
    
    // Quitar hash ancla si lo tiene
    const cleanPath = targetPath.split("#")[0];
    checkedLinks++;
    if (!fs.existsSync(cleanPath)) {
      brokenLinks++;
      fail(`Enlace roto en ${path.relative(ROOT, file)}: -> ${rawLink}`);
    }
  }
}

if (brokenLinks === 0) {
  pass(`Todos los ${checkedLinks} enlaces locales en documentación resuelven correctamente.`);
}

// Resumen Final
console.log("\n========================================================");
if (errors.length > 0) {
  console.log(`\x1b[31m✗ FALLO EN LA COMPROBACIÓN DEL ARNÉS: ${errors.length} errores encontrados.\x1b[0m`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✓ ARNÉS 100% SANO: ${passedChecks} comprobaciones exitosas, 0 errores.\x1b[0m`);
  if (warnings.length > 0) {
    console.log(`\x1b[33m! ${warnings.length} advertencias menores.\x1b[0m`);
  }
  process.exit(0);
}
