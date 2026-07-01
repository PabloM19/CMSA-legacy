# CMSA Wireframe — Fase 1

Wireframe interactivo funcional para la aplicación interna de producción compartida entre **SUMO** y **MAF**. Esta fase no tiene backend real: todo funciona con datos mock en `localStorage` para validar flujos, pantallas, estados visuales, permisos simulados y navegación.

La pantalla principal operativa es **`/plant-map`**, accesible también **sin login** (vista pública de consulta).

## Stack

- React 19 + TypeScript
- Vite
- react-router-dom
- lucide-react (iconos)
- CSS propio (tokens + glassmorphism, sin librerías UI)

## Inicio rápido

```bash
npm install
npm run dev
```

Abre la URL que indique Vite (normalmente `http://localhost:5173`). La raíz `/` redirige a **`/plant-map`**.

Otros scripts:

```bash
npm run build    # compilación de producción
npm run preview  # previsualizar el build
npm run lint     # ESLint
npx tsx scripts/validation-flow-check.ts   # checks flujo R/M + validación
npx tsx scripts/plant-map-check.ts         # checks pictograma y sincronización
```

### Demo en consola del navegador

Tras cargar la app en desarrollo:

```js
window.cmsaDemo?.seedDemoFull()      // escenario completo (cola, mapa, alarmas demo)
window.cmsaDemo?.resetDemoClean()    // limpiar pedidos e incidencias
window.cmsaDemo?.clearCmsaLocalStorage()
```

## Rutas y pantallas

| Ruta | Pantalla | Acceso |
|------|----------|--------|
| `/plant-map` | Mapa de planta (responsive) | **Público** + autenticado |
| `/login` | Inicio de sesión | Público |
| `/backlog` | Cola diaria (kanban) | Operarios + Supervisor + Super Admin |
| `/orders/new` | Nuevo objetivo | Operarios + Supervisor + Super Admin |
| `/alarms` | Alarmas operativas | Supervisor + Super Admin |
| `/admin` | Administración | Supervisor (parcial) + Super Admin (completo) |
| `/profile` | Perfil y preferencias | Autenticado |
| `/tablet` | Vista tablet planta | Autenticado (según rol) |
| `/mobile` | Vista móvil consulta | Autenticado (según rol) |
| `/dashboard` | — | ↪ redirige a `/plant-map` |
| `/validation` | — | ↪ redirige a `/plant-map` |

## Login y credenciales

Pantalla centrada con glassmorphism. Selector **ES / EN** (preferencia en `localStorage`, clave `cmsa-auth` para sesión).

Tras login correcto → **`/plant-map`** (todos los roles).

| Usuario | Contraseña | Empresa | Rol |
|---------|------------|---------|-----|
| `operario_sumo` | `1234` | SUMO | Operario |
| `operario_maf` | `124` | MAF | Operario |
| `usuario_supervisor` | `sup123` | GLOBAL | Supervisor |
| `usuario_superadmin` | `admin123` | GLOBAL | Super Admin |

Alias ocultos de compatibilidad: `usuario_sumo`, `usuario_maf`, `usuario_master` (mapean a cuentas existentes).

## Roles y permisos

| Rol | Sidebar / rutas principales | Acciones destacadas |
|-----|----------------------------|---------------------|
| **Operario** (`user`, SUMO/MAF) | Mapa, nuevo objetivo, cola diaria | Ver alarmas en mapa; no marcar como revisadas |
| **Supervisor** | + Alarmas, Admin (referencias y alarmas) | Marcar alarmas revisadas; incidencias tablet |
| **Super Admin** | Admin completo | Todo lo anterior + usuarios, mesas, config, auditoría |

**Guest (sin sesión):** mapa de planta, resumen, leyenda, tabla de alarmas activas (solo lectura), botón *Iniciar sesión*. Sin sidebar ni acciones operativas.

Lógica centralizada en `src/utils/permissions.ts`.

## Datos mock y persistencia

Estado operativo consolidado en **`cmsa-backlog-orders`**:

```json
{
  "orders": [...],
  "plantTables": [...],
  "plantPalletizers": [...]
}
```

Otras claves relevantes:

| Clave | Uso |
|-------|-----|
| `cmsa-auth` | Sesión mock |
| `cmsa-lang` | Idioma ES / EN |
| `cmsa-created-orders` | Objetivos creados desde `/orders/new` |
| `cmsa-cell-alarms` | Alarmas mock de celda (mapa + `/alarms`) |
| `cmsa-admin-data` | CRUD admin |
| `cmsa-tablet-overrides` | Overrides táctiles en planta |

**Planta**

- Automáticas: **R1–R9**
- Manuales: **M1–M7**
- Paletizadores: **P1–P8**

Cola diaria, mapa y mesas comparten el mismo estado (`rebuildPlantTablesFromOrders` en `src/utils/plantSync.ts`).

## Cola diaria (`/backlog`)

Tablero kanban de **objetivos** con tres columnas operativas:

1. **Por ordenar**
2. **En preparación** (modal mock de preparación / confirmación de celda)
3. **En producción**

Vistas por chips: **Resumen** (entrada por defecto), **Vista completa**, **En curso**, **Acabados**.

- KPIs superiores, drag & drop simulado, filtros por empresa (operarios ven solo los suyos)
- Sincronización con mesas del pictograma vía `localStorage`
- Validación de mesas integrada en el flujo de preparación (no hay pantalla `/validation` activa)

## Mapa de planta (`/plant-map`)

Una sola ruta, layout según ancho (`useBreakpoint`):

| Ancho | Vista |
|-------|--------|
| ≥1100px | Escritorio: resumen, leyenda, pictograma, tabla de alarmas, drawers |
| 768–1099px | Tablet: pictograma táctil, KPIs, producción activa, drawer inferior |
| &lt;768px | Móvil autenticado: consulta compacta (solo lectura operativa) |

**Distribución fija (izquierda → derecha)**

- **Norte:** `M3 M2 M1 R9 R8 R7 R6 R5 R4 R3 R2 R1`
- **Sur:** `M7 M6 M5 M4 P8 P7 P6 P5 P4 P3 P2 P1`

**Resumen superior:** mesas libres, ocupadas (chips SUMO/MAF), preparación, espera, bloqueos/incidencias, alarmas activas.

**Celdas (R/M/P)**

- Franja superior de empresa: **SUMO morado**, **MAF naranja**, libre neutra (6px)
- Fondo según estado: producción (verde), espera (amarillo), bloqueo/incidencia (rojo), preparación (violeta), libre (neutro)
- Código + icono de **velocidad** arriba a la derecha (si aplica)
- ETA solo si existe; **% ocupación** en celdas ocupadas
- Iconos de **estado/alarma** abajo (aviso, pausa, bloqueo, etc.)
- Click → drawer de celda con objetivo, ETA, ocupación y alarma vinculada

**Alarmas activas (debajo del mapa)**

Tabla con buscador en tiempo real y columnas: Hora, Objetivo, Empresa, Celda, Tipo, Severidad, Estado, Acción.

Objetivos demo con alarma (naranja):

| Referencia | Celda | Tipo |
|------------|-------|------|
| `ALM-SUMO-EXCESO-001` | R4 | Exceso de cajas |
| `ALM-MAF-FALTA-001` | R6 | Falta de cajas |
| `ALM-SUMO-BLOQ-001` | M2 | Bloqueo por incidencia |

Supervisor / Super Admin pueden **marcar como revisada**. Reasignación de destino: placeholder deshabilitado (pendiente reunión cliente).

Página dedicada: **`/alarms`** (mismo mock, listado ampliado).

## Nuevo objetivo (`/orders/new`)

Formulario mock por pasos: catálogo de productos (naranjas), cálculo de mesas/ETA, confirmación y persistencia en cola diaria.

## Administración (`/admin`)

Filtrada por rol:

- **Supervisor:** referencias de producto, alarmas
- **Super Admin:** usuarios, empresas, mesas, paletizadores, referencias, alarmas, auditoría

Persistencia en `cmsa-admin-data`. Cambios de mesas se reflejan en el mapa.

## Perfil (`/profile`)

Avatar mock, datos de contacto, idioma, tema claro/oscuro, cambio de contraseña simulado.

## Estructura del proyecto

```
src/
├── app/                    # Router, providers, redirects
├── components/
│   ├── layout/             # Sidebar, header, PlantMapShell, PublicLayout
│   └── ui/
├── features/
│   ├── auth/
│   ├── backlog/            # Cola diaria
│   ├── orders/             # Nuevo objetivo
│   ├── plant-map/          # Pictograma + alarmas en mapa
│   ├── alarms/
│   ├── admin/
│   ├── profile/
│   ├── tablet/
│   └── mobile/
├── data/                   # Mocks (pedidos, planta, alarmas, usuarios)
├── i18n/                   # ES / EN
├── styles/
├── types/
└── utils/                  # Storage, permisos, plantSync, demoSeed…
```

## Diseño

Identidad **CMSA** (Process Cyan `#00A0D2`). Tokens en `src/styles/tokens.css`.

- **SUMO:** morado · **MAF:** naranja · **GLOBAL/CMSA:** cyan / gris
- Glassmorphism, sidebar colapsable con tooltips, menú de usuario en header
- Logos en `public/logos/`

## Alcance Fase 1

- ✅ Mapa de planta público + operativo con alarmas mock y resumen
- ✅ Cola diaria 3 columnas + vistas Resumen / En curso / Acabados
- ✅ Nuevo objetivo con catálogo mock
- ✅ Auth mock, roles (operario, supervisor, super admin), i18n ES/EN
- ✅ Admin filtrado por rol, perfil, alarmas
- ✅ Tablet / móvil como vistas de consulta o supervisión
- ❌ Backend, API real, Firebase
- ❌ Reasignación de destino entre celdas (pendiente definición cliente)
- ❌ Lógica real de alarmas / timeouts de preparación
- ❌ Recuperación de contraseña real

---

*Wireframe funcional · Datos simulados*
