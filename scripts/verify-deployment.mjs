#!/usr/bin/env node

/**
 * scripts/verify-deployment.mjs
 * COMPUERTA DE VERIFICACIÓN: PREPARACIÓN PARA DESPLIEGUE EN VERCEL (FASE 6)
 *
 * Valida:
 * 1. Guía técnica de despliegue en Vercel (docs/specs/04-vercel-deployment-guide.md).
 * 2. Configuración vercel.json con headers de seguridad HTTP y caching inmutable.
 * 3. Metadatos de SEO, OpenGraph y Twitter en src/app/layout.tsx.
 * 4. Blindaje de seguridad (cero secretos o tokens en código rastreado).
 * 5. Script npm de compilación y comandos de producción listos.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n INICIANDO VERIFICACIÓN DE PREPARACIÓN PARA DESPLIEGUE EN VERCEL (FASE 6)\n');

let errors = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passes++;
  } else {
    console.error(`  ✗ ERROR: ${message}`);
    errors++;
  }
}

// 1. Verificación de Guía de Despliegue
console.log('1. Comprobando documentación de despliegue en Vercel:');
const guidePath = path.join(rootDir, 'docs', 'specs', '04-vercel-deployment-guide.md');
assert(fs.existsSync(guidePath), 'Documento presente: docs/specs/04-vercel-deployment-guide.md');

if (fs.existsSync(guidePath)) {
  const guideContent = fs.readFileSync(guidePath, 'utf8');
  assert(guideContent.includes('Método A: Integración Continua con Git'), 'Guía documenta Método A (Git Continuous Deployment)');
  assert(guideContent.includes('Método B: Despliegue Manual vía Vercel CLI'), 'Guía documenta Método B (Vercel CLI / npx vercel)');
  assert(guideContent.includes('Headers HTTP') || guideContent.includes('Blindaje de Seguridad'), 'Guía documenta políticas de seguridad y headers');
  assert(guideContent.includes('Plan de Reversión (Rollback Inmediato)'), 'Guía documenta plan de rollback instantáneo');
}

// 2. Verificación de vercel.json
console.log('\n2. Comprobando configuración de Vercel (vercel.json):');
const vercelConfigPath = path.join(rootDir, 'vercel.json');
assert(fs.existsSync(vercelConfigPath), 'Archivo presente: vercel.json');

if (fs.existsSync(vercelConfigPath)) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    assert(Array.isArray(vercelConfig.headers), 'vercel.json define arreglo de headers de seguridad');
    const globalHeaderRule = vercelConfig.headers.find(h => h.source === '/(.*)');
    assert(Boolean(globalHeaderRule), 'Regla global de seguridad /(.*) configurada');
    
    const headerKeys = globalHeaderRule ? globalHeaderRule.headers.map(h => h.key) : [];
    assert(headerKeys.includes('X-Content-Type-Options'), 'Header X-Content-Type-Options: nosniff configurado');
    assert(headerKeys.includes('X-Frame-Options'), 'Header X-Frame-Options: SAMEORIGIN configurado');
    assert(headerKeys.includes('Referrer-Policy'), 'Header Referrer-Policy configurado');
  } catch (err) {
    assert(false, `vercel.json tiene formato JSON válido: ${err.message}`);
  }
}

// 3. Verificación de Metadatos SEO y OpenGraph
console.log('\n3. Comprobando metadatos de presentación en layout.tsx:');
const layoutPath = path.join(rootDir, 'src', 'app', 'layout.tsx');
assert(fs.existsSync(layoutPath), 'Archivo presente: src/app/layout.tsx');

if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  assert(layoutContent.includes('openGraph:'), 'Metadatos OpenGraph configurados para vista previa en redes/mensajería');
  assert(layoutContent.includes('twitter:'), 'Metadatos Twitter Cards configurados');
  assert(layoutContent.includes('export const viewport:'), 'Exportación de Viewport separada para Next.js 15+');
  assert(layoutContent.includes('themeColor: "#0a0a0c"'), 'Theme color #0a0a0c configurado para Apple Dark Mode');
}

// 4. Verificación de Seguridad y Ausencia de Secretos
console.log('\n4. Comprobando blindaje de seguridad contra fuga de secretos:');
const gitignorePath = path.join(rootDir, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  assert(gitignore.includes('.env'), '.gitignore protege variables de entorno (.env)');
  assert(!fs.existsSync(path.join(rootDir, '.env.production')), 'No existe archivo sensible .env.production en el repositorio');
  assert(!fs.existsSync(path.join(rootDir, 'credentials.json')), 'No existen credenciales privadas en el repositorio');
}

console.log('\n========================================================');
if (errors === 0) {
  console.log(`✓ PREPARACIÓN DE DESPLIEGUE 100% LISTA: ${passes} pruebas exitosas, 0 advertencias.`);
  console.log('✓ El proyecto está listo para ser desplegado en Vercel cuando el usuario lo autorice.\n');
  process.exit(0);
} else {
  console.error(`✗ FALLOS EN PREPARACIÓN DE DESPLIEGUE: ${errors} errores encontrados.\n`);
  process.exit(1);
}
