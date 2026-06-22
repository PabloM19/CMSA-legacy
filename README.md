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
| `/dashboard` | Panel principal | 🔲 Placeholder |
| `/orders/new` | Nueva orden | 🔲 Placeholder |
| `/backlog` | Backlog | 🔲 Placeholder |
| `/validation` | Validación | 🔲 Placeholder |
| `/plant-map` | Mapa de planta | 🔲 Placeholder |
| `/tablet` | Vista tablet | 🔲 Placeholder |
| `/mobile` | Vista mobile | 🔲 Placeholder |
| `/admin` | Administración | 🔲 Placeholder |

## Login

Pantalla centrada con glassmorphism, fondo claro y formas abstractas suaves. Incluye selector de idioma **ES / EN** (se guarda en `localStorage`).

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

Tokens de color en `src/styles/tokens.css`:

- Neutros: blanco, negro, escala de grises
- **SUMO**: morado (`#7c3aed`)
- **MAF**: naranja (`#ea580c`)
- Glassmorphism: fondos translúcidos, blur, bordes y sombras suaves

## Alcance de Fase 1

- ✅ Setup inicial, routing y layout base
- ✅ Login con auth mock e i18n ES/EN
- 🔲 Resto de pantallas principales (en progreso)
- ❌ Backend, API real, Firebase
- ❌ Recuperación de contraseña real

---

*Wireframe funcional · Datos simulados*
