import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { settings } from '#/db/schema'
import { DEFAULT_MAINTENANCE, DEFAULT_MAINTENANCE_MESSAGE, maintenanceSetting } from '#/lib/settings'
import { currentUser } from '#/server/current-user'
import { requireAdmin } from '#/server/session'

import type { MaintenanceSetting } from '#/lib/settings'

async function readMaintenance(): Promise<MaintenanceSetting> {
  const [row] = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, 'maintenance'))
  const parsed = maintenanceSetting.safeParse(row?.value)
  return parsed.success ? parsed.data : DEFAULT_MAINTENANCE
}

/** Whether maintenance mode is on and the visitor is signed in, which lets them see the site anyway. */
export const getSiteStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const [maintenance, user] = await Promise.all([readMaintenance(), currentUser()])
  return {
    maintenance: maintenance.enabled,
    message: maintenance.message || DEFAULT_MAINTENANCE_MESSAGE,
    signedIn: Boolean(user),
  }
})

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminGetSettings = createServerFn({ method: 'GET' })
  .middleware([requireAdmin])
  .handler(async () => ({ maintenance: await readMaintenance() }))

export const updateMaintenance = createServerFn({ method: 'POST' })
  .middleware([requireAdmin])
  .validator(maintenanceSetting)
  .handler(async ({ data }) => {
    await db
      .insert(settings)
      .values({ key: 'maintenance', value: data })
      .onConflictDoUpdate({ target: settings.key, set: { value: data, updatedAt: new Date() } })
  })
