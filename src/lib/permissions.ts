import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access'

/**
 * Backoffice roles:
 * - admin: manages users and every content
 * - editor: manages contents only (events, B&Bs, restaurants, cultural places)
 */
export const ROLES = [
  { id: 'admin', label: 'Amministratore', description: 'Gestisce utenti e tutti i contenuti' },
  { id: 'editor', label: 'Redattore', description: 'Gestisce eventi, B&B, ristoranti e luoghi culturali' },
] as const

export type Role = (typeof ROLES)[number]['id']

export const isRole = (value: unknown): value is Role => ROLES.some((role) => role.id === value)

export const ac = createAccessControl(defaultStatements)

export const roles = {
  admin: ac.newRole(adminAc.statements),
  editor: ac.newRole({ user: [], session: [] }),
}
