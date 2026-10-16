import { z } from 'zod'

/** Maintenance mode: while on, visitors who aren't signed in only see the maintenance page. */
export const maintenanceSetting = z.object({
  enabled: z.boolean(),
  /** Shown on the maintenance page; empty uses DEFAULT_MAINTENANCE_MESSAGE. */
  message: z.string().trim().max(500, 'Al massimo 500 caratteri'),
})

export type MaintenanceSetting = z.infer<typeof maintenanceSetting>

export const DEFAULT_MAINTENANCE: MaintenanceSetting = { enabled: false, message: '' }

export const DEFAULT_MAINTENANCE_MESSAGE =
  'Stiamo lavorando per rendere Visit Camaiore ancora più bello. Torna a trovarci tra poco.'
