# CMSA Wireframe — Fase 1

Wireframe interactivo funcional para la aplicación interna de producción compartida entre **SUMO** y **MAF**. Esta fase no tiene backend real: todo funciona con datos mock para validar flujos, pantallas, estados visuales, permisos simulados y navegación.

## Stack

- React 19 + TypeScript
- Vite
- react-router-dom
- lucide-react (iconos puntuales)
- CSS propio (tokens + glassmorphism, sin librerías UI)

## Inicio rápido

```bash
npm install
npm run dev
```

Abre la URL que indique Vite (normalmente `http://localhost:5173`). La raíz redirige a `/login`.

Otros scripts:

```bash
npm run build    # compilación de producción
npm run preview  # previsualizar el build
npm run lint     # ESLint
npx tsx scripts/validation-flow-check.ts   # checks del flujo R/M + validación
npx tsx scripts/plant-map-check.ts           # checks del pictograma y sincronización
```

## Estado de pantallas

| Ruta | Pantalla | Estado |
|------|----------|--------|
| `/login` | Inicio de sesión | ✅ Implementada |
| `/dashboard` | Panel operativo PC | ✅ v1 mock |
| `/orders/new` | Nueva orden | ✅ v1 mock |
| `/backlog` | Backlog kanban | ✅ v1 mock + localStorage |
| `/validation` | Validación de mesas | ✅ v1 mock + localStorage |
| `/plant-map` | Mapa de planta (responsive) | ✅ v1 mock + localStorage |
| `/tablet` | — | ↪ redirige a `/plant-map` |
| `/mobile` | — | ↪ redirige a `/plant-map` |
| `/admin` | Administración | 🔲 Placeholder |

## Login

Pantalla centrada con glassmorphism, fondo claro y formas abstractas suaves.

**Idioma**

- Selector **ES / EN** fijo arriba a la derecha (login) y en el header (app autenticada)
- Preferencia guardada en `localStorage` (`cmsa-lang`) y aplicada en toda la app
- Traduce login, sidebar, header y pantallas principales

**Comportamiento**

- Autenticación simulada contra usuarios mock (delay de 600 ms).
- Sesión persistida en `localStorage` bajo la clave `cmsa-auth`.
- Redirección tras login correcto:
  - `user` (SUMO / MAF) → `/dashboard`
  - `master` → `/dashboard`
  - `validator` → `/validation`
- Mensaje de error claro si las credenciales no coinciden.
- Botón de ayuda para mostrar credenciales mock durante desarrollo.

**Credenciales de prueba**

| Usuario | Contraseña | Empresa | Rol | Destino |
|---------|------------|---------|-----|---------|
| `usuario_sumo` | `1234` | SUMO | user | `/dashboard` |
| `usuario_maf` | `124` | MAF | user | `/dashboard` |
| `usuario_master` | `master123` | MASTER | master | `/dashboard` |
| `usuario_validador` | `val123` | CMSA | validator | `/validation` |

## Sesión y rutas protegidas

Autenticación mock con `AuthProvider` + hook `useAuth`. La sesión se persiste en `localStorage` (`cmsa-auth`).

**Layout autenticado**

- Header con nombre, empresa, rol, fecha actual y botón **Salir**
- Color de acento según empresa: SUMO morado, MAF naranja, MASTER negro/gris, CMSA (validador) gris-azul
- Sidebar muestra solo las rutas permitidas para el usuario activo

**Permisos por rol**

| Rol | Rutas accesibles |
|-----|------------------|
| `user` (SUMO / MAF) | `/dashboard`, `/orders/new`, `/backlog`, `/plant-map` |
| `validator` | `/validation`, `/plant-map` |
| `master` | Todas |

Si no hay sesión → redirección a `/login`. Si la ruta no está permitida → redirección a la pantalla principal del rol (`/dashboard` o `/validation`).

## Datos mock y persistencia

Estado consolidado en `localStorage` bajo la clave **`cmsa-backlog-orders`**:

```json
{
  "orders": [...],
  "plantTables": [...],
  "plantPalletizers": [...]
}
```

También se usa `cmsa-created-orders` para pedidos creados desde `/orders/new`.

**Mesas de planta**

- Automáticas: **R1–R9**
- Manuales: **M1–M7**
- Paletizadores: **P1–P8** (secundarios, mock estable)

Al mover un pedido a `pendiente_validacion`, se asignan mesas R y, si hace falta, M (`src/utils/tableAssignment.ts`). Backlog, validación y pictograma leen la misma fuente.

## Backlog (`/backlog`)

Kanban con columnas de estado, KPIs (incl. cola con desglose backlog / pend. lanzamiento), tarjetas de pedido y modal de detalle. Acciones simuladas: mover estado, lanzar a validación, etc. Sincronizado con mesas y validación vía storage.

## Validación (`/validation`)

Flujo operativo para validadores y master:

- Listado de pedidos pendientes de validación
- Validar mesa individual, validar todas, marcar conflicto, resolver conflicto
- Iniciar producción cuando todas las mesas están validadas
- SUMO / MAF: solo lectura

## Mapa de planta (`/plant-map`)

Una sola ruta que **se adapta al ancho de pantalla** (hook `useBreakpoint`):

| Ancho | Layout |
|-------|--------|
| ≥1100px (escritorio) | Pictograma completo + leyenda + drawer lateral |
| 768–1099px (tablet) | Pictograma táctil ampliado, KPIs, producción activa, alertas, drawer inferior con acciones mock |
| &lt;768px (móvil) | Consulta compacta solo lectura: estado, capacidad, producción, alertas, minimapa |

No hay entradas separadas en el menú para tablet ni móvil. Las URLs `/tablet` y `/mobile` redirigen a `/plant-map` por compatibilidad.

**Distribución fija del pictograma (izquierda → derecha)**

- Fila superior: `M3 M2 M1 R9 R8 R7 R6 R5 R4 R3 R2 R1`
- Fila inferior: `M7 M6 M5 M4 P8 P7 P6 P5 P4 P3 P2 P1`

**Estados visuales**

- Libre, reservada / pendiente validación, ocupada, en espera, bloqueada, conflicto
- Borde de empresa: SUMO morado, MAF naranja (degradado suave, no fondo saturado)
- Velocidad mock: lento / normal / rápido
- Click en mesa R/M → drawer con detalle de pedido; paletizadores con detalle básico

**Tablet (768–1099px)**

- Pantalla de **supervisión táctil en planta**, no un dashboard reducido.
- **Pictograma grande** como elemento principal (mesas R/M, paletizadores P, estados, colores SUMO/MAF, iconos velocidad/warning/pausa).
- Franja de resumen: estado general, producción activa, mesas ocupadas/libres, alertas, próximos fin.
- **Drawer inferior** al tocar un elemento: detalle completo + acciones de emergencia según rol (con confirmación).
- Producción activa en **cards horizontales**; alertas tocables para ir al elemento.
- **Roles:** `master` parada/reanudación/incidencia; `validator` incidencia; SUMO/MAF solo consulta en acciones críticas.
- **Persistencia:** overrides en `cmsa-tablet-overrides`.

**Móvil (&lt;768px)**

- Shell propio con **menú hamburguesa** (sin sidebar de escritorio).
- Monitorización rápida **solo consulta**: estado general, capacidad SUMO/MAF (%), producción activa, próximas finalizaciones, alertas, resumen de mesas (incl. manuales/automáticas) y barras de ocupación R/M/P.
- **Sin botones operativos** en la vista de monitor. Navegación móvil limitada (operarios → solo mapa; validador/master → rutas adicionales según rol).
- Footer: *Vista solo consulta — acciones en PC/tablet*.

Componentes: `PlantMapPage` (orquestador), `PlantMapDesktopView`, `PlantMapTabletView`, `PlantMapMobileView`, `PlantLayout`, `PlantElementCard`, `PlantLegend`, `PlantElementDrawer`.

## Estructura del proyecto

```
src/
├── app/                    # App y rutas
├── components/
│   ├── layout/             # Sidebar, header, layout interno
│   └── ui/                 # Componentes reutilizables
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── orders/
│   ├── backlog/
│   ├── validation/
│   └── plant-map/
├── data/                   # Mocks y layout de planta
├── i18n/                   # ES / EN
├── styles/                 # tokens.css, globals.css
├── types/
└── utils/                  # Auth, backlogStorage, tableAssignment, plantMapHelpers…
```

## Diseño

Identidad visual alineada al manual de marca **CMSA** (Pantone Process Cyan). Tokens en `src/styles/tokens.css`.

- **CMSA (marca principal)**: Process Cyan `#00A0D2` — botones, navegación activa, acentos, fondos suaves
- **Logos**: `public/logos/` — fondo blanco en login/sidebar; variante fondo azul disponible vía `<CmsaLogo variant="dark" />`
- **SUMO / MAF**: acentos secundarios en badge de header y borde izquierdo de mesas en pictograma
- **MASTER**: negro / gris en badge de header
- Glassmorphism: fondos translúcidos, blur, bordes y sombras en tonos cyan

## Alcance de Fase 1

- ✅ Setup inicial, routing y layout base
- ✅ Login con auth mock e i18n ES/EN
- ✅ Sesión mock, rutas protegidas y permisos por rol
- ✅ Dashboard operativo PC v1 (KPIs, pedidos, producción activa, alertas)
- ✅ Nueva orden v1 (formulario, cálculo mock, modal confirmación, localStorage)
- ✅ Backlog kanban v1 con storage consolidado y asignación mock R/M
- ✅ Validación de mesas v1 (conflictos, iniciar producción)
- ✅ Mapa de planta responsive v1 (escritorio / tablet / móvil según ancho, una sola ruta)
- 🔲 Admin
- ❌ Backend, API real, Firebase
- ❌ Recuperación de contraseña real

---

*Wireframe funcional · Datos simulados*
