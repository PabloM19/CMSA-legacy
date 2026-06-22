export type Lang = 'es' | 'en'

const translations = {
  es: {
    title: 'Bienvenido a CMSA',
    subtitle: 'Identifícate para acceder al panel operativo',
    username: 'Usuario',
    password: 'Contraseña',
    usernamePlaceholder: 'Tu usuario',
    passwordPlaceholder: 'Tu contraseña',
    submit: 'Acceder',
    loading: 'Accediendo…',
    error: 'Usuario o contraseña incorrectos.',
    footer: 'Wireframe funcional · Datos simulados',
    helpToggle: 'Ver credenciales mock',
    helpHide: 'Ocultar credenciales',
    helpTitle: 'Credenciales de desarrollo',
  },
  en: {
    title: 'Welcome to CMSA',
    subtitle: 'Sign in to access the operations dashboard',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Your username',
    passwordPlaceholder: 'Your password',
    submit: 'Sign in',
    loading: 'Signing in…',
    error: 'Invalid username or password.',
    footer: 'Functional wireframe · Simulated data',
    helpToggle: 'Show mock credentials',
    helpHide: 'Hide credentials',
    helpTitle: 'Development credentials',
  },
} as const

export function t(lang: Lang) {
  return translations[lang]
}
