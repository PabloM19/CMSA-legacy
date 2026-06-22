export type Lang = 'es' | 'en'

export type NavKey =
  | 'dashboard'
  | 'newOrder'
  | 'backlog'
  | 'validation'
  | 'plantMap'
  | 'tablet'
  | 'mobile'
  | 'admin'

const translations = {
  es: {
    common: {
      logout: 'Salir',
      wireframeSubtitle: 'Wireframe Fase 1',
      wireframeFooter: 'Wireframe funcional · Datos simulados',
    },
    roles: {
      user: 'Usuario',
      master: 'Master',
      validator: 'Validador',
    },
    nav: {
      dashboard: 'Dashboard',
      newOrder: 'Nueva orden',
      backlog: 'Backlog',
      validation: 'Validación',
      plantMap: 'Mapa de planta',
      tablet: 'Tablet',
      mobile: 'Mobile',
      admin: 'Admin',
    },
    login: {
      title: 'Bienvenido a CMSA',
      subtitle: 'Identifícate para acceder al panel operativo',
      username: 'Usuario',
      password: 'Contraseña',
      usernamePlaceholder: 'Tu usuario',
      passwordPlaceholder: 'Tu contraseña',
      submit: 'Acceder',
      loading: 'Accediendo…',
      error: 'Usuario o contraseña incorrectos.',
      helpToggle: 'Ver credenciales mock',
      helpHide: 'Ocultar credenciales',
      helpTitle: 'Credenciales de desarrollo',
    },
  },
  en: {
    common: {
      logout: 'Sign out',
      wireframeSubtitle: 'Wireframe Phase 1',
      wireframeFooter: 'Functional wireframe · Simulated data',
    },
    roles: {
      user: 'User',
      master: 'Master',
      validator: 'Validator',
    },
    nav: {
      dashboard: 'Dashboard',
      newOrder: 'New order',
      backlog: 'Backlog',
      validation: 'Validation',
      plantMap: 'Plant map',
      tablet: 'Tablet',
      mobile: 'Mobile',
      admin: 'Admin',
    },
    login: {
      title: 'Welcome to CMSA',
      subtitle: 'Sign in to access the operations dashboard',
      username: 'Username',
      password: 'Password',
      usernamePlaceholder: 'Your username',
      passwordPlaceholder: 'Your password',
      submit: 'Sign in',
      loading: 'Signing in…',
      error: 'Invalid username or password.',
      helpToggle: 'Show mock credentials',
      helpHide: 'Hide credentials',
      helpTitle: 'Development credentials',
    },
  },
} as const

export type Translations = (typeof translations)[Lang]

export function getTranslations(lang: Lang): Translations {
  return translations[lang]
}

export function getDateLocale(lang: Lang): string {
  return lang === 'en' ? 'en-US' : 'es-ES'
}
