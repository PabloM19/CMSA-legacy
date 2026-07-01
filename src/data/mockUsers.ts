import type { User } from '../types/auth'

export interface MockCredential {
  username: string
  password: string
  user: User
  /** Etiqueta visible en ayuda de login */
  roleLabel?: string
  hidden?: boolean
}

const operarioSumo: User = {
  id: 'u1',
  username: 'operario_sumo',
  name: 'Operario SUMO',
  company: 'SUMO',
  role: 'user',
}

const operarioMaf: User = {
  id: 'u2',
  username: 'operario_maf',
  name: 'Operario MAF',
  company: 'MAF',
  role: 'user',
}

const supervisor: User = {
  id: 'u3',
  username: 'usuario_supervisor',
  name: 'Supervisor CMSA',
  company: 'GLOBAL',
  role: 'supervisor',
}

const superadmin: User = {
  id: 'u4',
  username: 'usuario_superadmin',
  name: 'Super Admin CMSA',
  company: 'GLOBAL',
  role: 'superadmin',
}

export const mockCredentials: MockCredential[] = [
  {
    username: 'operario_sumo',
    password: '1234',
    user: operarioSumo,
    roleLabel: 'Operario SUMO',
  },
  {
    username: 'operario_maf',
    password: '124',
    user: operarioMaf,
    roleLabel: 'Operario MAF',
  },
  {
    username: 'usuario_supervisor',
    password: 'sup123',
    user: supervisor,
    roleLabel: 'Supervisor',
  },
  {
    username: 'usuario_superadmin',
    password: 'admin123',
    user: superadmin,
    roleLabel: 'Super Admin',
  },
  // Alias de compatibilidad (no listados en ayuda principal)
  { username: 'usuario_sumo', password: '1234', user: operarioSumo, hidden: true },
  { username: 'usuario_maf', password: '124', user: operarioMaf, hidden: true },
  {
    username: 'usuario_master',
    password: 'master123',
    user: { ...superadmin, username: 'usuario_master', name: 'Super Admin CMSA' },
    hidden: true,
  },
]

/** Credenciales visibles en el panel de ayuda del login */
export function getVisibleMockCredentials(): MockCredential[] {
  return mockCredentials.filter((c) => !c.hidden)
}
