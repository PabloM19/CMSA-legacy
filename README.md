# CMSA Wireframe — Fase 1

Wireframe interactivo funcional para la aplicación interna de producción compartida entre **SUMO** y **MAF**. Esta fase no tiene backend real: todo funciona con datos mock para validar flujos, pantallas, estados visuales, permisos simulados y navegación.

## Stack

- React 19 + TypeScript
- Vite
- react-router-dom
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
```

## Estado de pantallas

| Ruta | Pantalla | Estado |
|------|----------|--------|
| `/login` | Inicio de sesión | ✅ Implementada |
| `/dashboard` | Panel operativo PC | ✅ v1 mock |
| `/orders/new` | Nueva orden | ✅ v1 mock |
| `/backlog` | Backlog | 🔲 Placeholder |
| `/validation` | Validación | 🔲 Placeholder |
| `/plant-map` | Mapa de planta | 🔲 Placeholder |
| `/tablet` | Vista tablet | 🔲 Placeholder |
| `/mobile` | Vista mobile | 🔲 Placeholder |
| `/admin` | Administración | 🔲 Placeholder |

## Login

Pantalla centrada con glassmorphism, fondo claro y formas abstractas suaves.

**Idioma**

- Selector **ES / EN** fijo arriba a la derecha (login) y en el header (app autenticada)
- Preferencia guardada en `localStorage` (`cmsa-lang`) y aplicada en toda la app
- Traduce login, sidebar, header (rol, fecha, logout) y crece con cada pantalla nueva

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
| `user` (SUMO / MAF) | `/dashboard`, `/orders/new`, `/backlog`, `/plant-map`, `/mobile` |
| `validator` | `/validation`, `/mobile` |
| `master` | Todas |

Si no hay sesión → redirección a `/login`. Si la ruta no está permitida → redirección a la pantalla principal del rol (`/dashboard` o `/validation`).

## Estructura del proyecto

```
src/
├── app/              # App y rutas
├── components/
│   ├── layout/       # Sidebar, header, layout interno
│   └── ui/           # Componentes reutilizables
├── features/         # Una carpeta por pantalla / dominio
├── data/             # Datos mock
├── styles/           # tokens.css, globals.css
├── types/            # Tipos TypeScript
└── utils/            # Auth, helpers
```

## Diseño

Identidad visual alineada al manual de marca **CMSA** (Pantone Process Cyan). Tokens en `src/styles/tokens.css`.

- **CMSA (marca principal)**: Process Cyan `#00A0D2` — botones, navegación activa, acentos, fondos suaves
- **Logos**: `public/logos/` — fondo blanco en login/sidebar; variante fondo azul disponible vía `<CmsaLogo variant="dark" />`
- **SUMO / MAF**: acentos secundarios solo en badge de empresa del header (usuario logueado)
- **MASTER**: negro / gris en badge de header
- Glassmorphism: fondos translúcidos, blur, bordes y sombras en tonos cyan

## Alcance de Fase 1

- ✅ Setup inicial, routing y layout base
- ✅ Login con auth mock e i18n ES/EN
- ✅ Sesión mock, rutas protegidas y permisos por rol
- 🔲 Resto de pantallas principales (en progreso)
- ✅ Dashboard operativo PC v1 (KPIs, pedidos, producción activa, alertas, pictograma)
- ✅ Nueva orden v1 (formulario, cálculo mock, modal confirmación, localStorage)
- ❌ Backend, API real, Firebase
- ❌ Recuperación de contraseña real

---

*Wireframe funcional · Datos simulados*
