# 04. Guía de Despliegue en Producción & Optimización Vercel

## 1. Visión General de la Infraestructura
**DemoPanel Inventory OS** está diseñado para ejecutarse en la red global Edge de Vercel, aprovechando:
- **Next.js 16 (App Router + Turbopack):** Pre-renderizado estático ultrarrápido para todas las rutas principales con hidratación selectiva.
- **Vercel Edge Network:** Despliegue distribuido en más de 300 ciudades globales con latencia de primer byte (TTFB) < 50ms.
- **Compresión Automática:** Entrega de assets bajo compresión Brotli / Zstandard optimizada.
- **Inmutabilidad y Caching:** Headers HTTP con `Cache-Control: public, max-age=31536000, immutable` para el bundle estático y chunks de estilos.

---

## 2. Métodos de Despliegue Disponibles

Existen dos vías principales para desplegar este proyecto a Vercel:

### Método A: Integración Continua con Git (Recomendado)
Este método conecta el repositorio de GitHub con Vercel. Cada vez que se haga un `git push` a `main`, Vercel construirá y publicará la versión de producción en segundos.

#### Pasos para la Integración Git:
1. Iniciar sesión en [Vercel](https://vercel.com).
2. Hacer clic en **"Add New..."** > **"Project"**.
3. Seleccionar la cuenta de GitHub `Diego-programand` e importar el repositorio:
   ```text
   demo-panel-inventary
   ```
4. Configuración del proyecto en la pantalla de importación:
   - **Framework Preset:** Next.js (detectado automáticamente).
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
5. Hacer clic en **"Deploy"**.
6. Vercel asignará un dominio productivo gratuito con certificado SSL Let's Encrypt automático (ej. `demo-panel-inventary.vercel.app`).

---

### Método B: Despliegue Manual vía Vercel CLI (`npx vercel`)
Permite desplegar directamente desde la terminal local sin necesidad de vincular previamente desde la web de Vercel.

#### Paso 1: Autenticación en la CLI
```bash
npx vercel login
```
*(Se abrirá el navegador para confirmar el acceso a la cuenta de Vercel).*

#### Paso 2: Despliegue de Prueba (Preview Deployment)
Para generar un enlace de vista previa privado antes de pasar a producción:
```bash
npx vercel deploy
```
- La CLI preguntará:
  - *Set up and deploy “g:\ITM\DemoDashboard”?* -> **Yes (`y`)**
  - *Which scope do you want to deploy to?* -> Seleccionar la cuenta del usuario.
  - *Link to existing project?* -> **No (`n`)** (la primera vez) o **Yes** si ya existe.
  - *What’s your project’s name?* -> `demo-panel-inventary`
  - *In which directory is your code located?* -> `./`
- En aproximadamente 30-45 segundos devolverá la URL de Preview (ej. `https://demo-panel-inventary-xyz.vercel.app`).

#### Paso 3: Despliegue a Producción (Production Deployment)
Cuando la versión de prueba esté aprobada:
```bash
npx vercel deploy --prod
```
La aplicación quedará disponible en el dominio principal de producción.

---

## 3. Blindaje de Seguridad y Headers HTTP

Para una presentación empresarial (Enterprise Showcase), el servidor debe enviar headers de protección contra ataques web comunes (Clickjacking, MIME Sniffing, XSS).

Se implementa en `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## 4. Metadata OpenGraph, Twitter Cards y SEO

Para que la demo destaque visualmente al compartirla en redes sociales, WhatsApp, Slack o LinkedIn:

- **Título SEO:** `DemoPanel Inventory OS — Enterprise Multi-Niche Showcase`
- **Descripción:** `Plataforma demostrativa de gestión de inventario empresarial de alto impacto visual y funcional con experiencia de usuario Apple HIG.`
- **OpenGraph Image:** Tarjeta visual 1200x630px representativa del panel.
- **Theme Color:** `#0a0a0c` (Dark Mode nativo Apple).

---

## 5. Checklist de Verificación Pre-Despliegue

Antes de ejecutar el despliegue, la suite de verificación automatizada debe validar:

1. **[ ] Cero Secretos en el Código:** Ningún token, API key ni archivo `.env` o credencial privada debe estar incluido en el bundle ni en el repositorio.
2. **[ ] Compilación Limpia:** `npm run build` debe generar páginas estáticas sin advertencias de tipos ni errores de hidratación.
3. **[ ] Coherencia de Datos Multidominio:** Los 4 nichos (Moda, Farmacéutica, Tecnología, Alimentos) deben cargar sin errores en el primer render.
4. **[ ] Suite Completa Exitosa:** `npm run verify:all` debe pasar con 100% de éxito.

---

## 6. Procedimiento Post-Despliegue (Smoke Testing en Vivo)

Una vez desplegado en Vercel:
1. Acceder a la URL pública asignada.
2. Verificar la carga inicial en < 1.5 segundos.
3. Conmutar el sector activo entre los 4 nichos y verificar que el vocabulario y las métricas se actualicen al instante.
4. Abrir la sección **Catálogo** y filtrar por SKU o categoría.
5. Abrir la sección **Movimientos & Kardex**, hacer clic en **"Exportar Libro Kardex"** y comprobar la descarga del archivo `.csv`.
6. Abrir el modal **"+ Nuevo Movimiento"**, probar la validación de stock negativo y comprobar el registro reactivo en la tabla.
7. Comprobar la visualización en dispositivos móviles (iPhone / Android) y tabletas iPad.

---

## 7. Plan de Reversión (Rollback Inmediato)
En caso de detectar cualquier inconveniente en producción:
- Vercel ofrece **Instant Rollback (Reversión Instantánea)** en menos de 1 segundo:
  1. Ir al Dashboard de Vercel > Proyecto `demo-panel-inventary` > Pestaña **Deployments**.
  2. Localizar el despliegue anterior estable.
  3. Clic en los tres puntos `...` > **"Promote to Production"**.
  4. El tráfico se redirige inmediatamente al despliegue anterior sin necesidad de reconstruir código.
