import { createFileRoute } from '@tanstack/react-router'
import { handleUpload } from '@vercel/blob/client'

import { currentUser } from '#/server/current-user'

import type { HandleUploadBody } from '@vercel/blob/client'

/** Photos of places: JPEG, PNG, WebP and AVIF, up to 15 MB each. */
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_BYTES = 15 * 1024 * 1024

/**
 * Issues Vercel Blob tokens for the admin's photo uploads: the browser then sends the file
 * straight to Blob, past the size limit of server functions. Signed-in admins and editors only.
 * Needs BLOB_READ_WRITE_TOKEN (set by Vercel once a Blob store is connected to the project).
 */
export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await currentUser())) return Response.json({ error: 'Accesso non autorizzato' }, { status: 401 })
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          return Response.json({ error: 'Caricamento foto non configurato: manca BLOB_READ_WRITE_TOKEN.' }, { status: 500 })
        }
        try {
          const body = (await request.json()) as HandleUploadBody
          const result = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
              if (!pathname.startsWith('luoghi/')) throw new Error('Percorso non consentito')
              return { allowedContentTypes: IMAGE_TYPES, maximumSizeInBytes: MAX_BYTES, addRandomSuffix: true }
            },
          })
          return Response.json(result)
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : 'Caricamento non riuscito' }, { status: 400 })
        }
      },
    },
  },
})
