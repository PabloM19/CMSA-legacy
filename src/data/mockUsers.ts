import type { User } from '../types/auth'

export interface MockCredential {
  username: string
  password: string
  user: User
}

export const mockCredentials: MockCredential[] = [
  {
    username: 'usuario_sumo',
    password: '1234',
    user: {
      id: 'u1',
      username: 'usuario_sumo',
      name: 'Operario SUMO',
      company: 'SUMO',
      role: 'user',
    },
  },
  {
    username: 'usuario_maf',
    password: '124',
    user: {
      id: 'u2',
      username: 'usuario_maf',
      name: 'Operario MAF',
      company: 'MAF',
      role: 'user',
    },
  },
  {
    username: 'usuario_master',
    password: 'master123',
    user: {
      id: 'u3',
      username: 'usuario_master',
      name: 'Usuario Master',
      company: 'MASTER',
      role: 'master',
    },
  },
  {
    username: 'usuario_validador',
    password: 'val123',
    user: {
      id: 'u4',
      username: 'usuario_validador',
      name: 'Validador CMSA',
      company: 'CMSA',
      role: 'validator',
    },
  },
]
