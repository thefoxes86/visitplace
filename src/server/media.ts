import { createServerFn } from '@tanstack/react-start'
import { del, list } from '@vercel/blob'
import { asc } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { pois } from '#/db/schema'
import { requireEditor } from '#/server/session'

/** A place showing the photo, as main image or in its gallery. */
export interface MediaUse {
  poiId: string
  name: string
  category: string
  as: 'image' | 'gallery'
}

/** A photo in the Blob store. */
export interface MediaItem {
  url: string
  pathname: string
  size: number
  uploadedAt: string
  usedBy: MediaUse[]
}

/** The library stops listing past this many photos. */
const MAX_ITEMS = 5000

function requireStore() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Libreria non disponibile: collega uno store Vercel Blob al progetto (manca BLOB_READ_WRITE_TOKEN).')
  }
}

/** Where each photo address is used on the site. */
async function uses() {
  const rows = await db
    .select({ id: pois.id, name: pois.name, category: pois.category, imageUrl: pois.imageUrl, gallery: pois.gallery })
    .from(pois)
    .orderBy(asc(pois.name))
  const byUrl = new Map<string, MediaUse[]>()
  const add = (url: string, use: MediaUse) => byUrl.set(url, [...(byUrl.get(url) ?? []), use])
  for (const row of rows) {
    const base = { poiId: row.id, name: row.name, category: row.category }
    if (row.imageUrl) add(row.imageUrl, { ...base, as: 'image' })
    for (const photo of row.gallery) add(photo.url, { ...base, as: 'gallery' })
  }
  return byUrl
}

/** Every photo in the Blob store, newest first, with the places using it. */
export const listMedia = createServerFn({ method: 'GET' })
  .middleware([requireEditor])
  .handler(async (): Promise<MediaItem[]> => {
    requireStore()
    const blobs = []
    let cursor: string | undefined
    do {
      const page = await list({ limit: 1000, cursor })
      blobs.push(...page.blobs)
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor && blobs.length < MAX_ITEMS)

    const usedBy = await uses()
    return blobs
      .map((blob) => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt).toISOString(),
        usedBy: usedBy.get(blob.url) ?? [],
      }))
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
  })

/** Deletes a photo from the store, unless a place still shows it. */
export const deleteMedia = createServerFn({ method: 'POST' })
  .middleware([requireEditor])
  .validator(z.object({ url: z.url() }))
  .handler(async ({ data }) => {
    requireStore()
    const usedBy = (await uses()).get(data.url) ?? []
    if (usedBy.length) {
      throw new Error(`La foto è ancora usata da: ${[...new Set(usedBy.map((u) => u.name))].join(', ')}. Toglila prima da lì.`)
    }
    await del(data.url)
  })
