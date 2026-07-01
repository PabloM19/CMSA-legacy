export type Company = 'SUMO' | 'MAF' | 'GLOBAL' | 'MASTER' | 'CMSA'

/** `user` = operario SUMO/MAF */
export type UserRole = 'user' | 'supervisor' | 'superadmin'

export interface User {
  id: string
  username: string
  name: string
  company: Company
  role: UserRole
}

export interface AuthSession {
  user: User
  loggedInAt: string
}
