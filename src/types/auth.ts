export type Company = 'SUMO' | 'MAF' | 'MASTER' | 'CMSA'

export type UserRole = 'user' | 'master' | 'validator'

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
