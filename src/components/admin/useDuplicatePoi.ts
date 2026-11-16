import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { errorMessage } from '#/components/admin/ui'
import { duplicatePoi } from '#/server/pois'

/** Copies a place into a new draft, then opens the copy to edit it. */
export function useDuplicatePoi() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function duplicate(poi: { id: string }, categorySlug: string) {
    setDuplicating(poi.id)
    setError(null)
    try {
      const { id } = await duplicatePoi({ data: { id: poi.id } })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'pois'] })
      await navigate({ to: '/admin/$category/$id', params: { category: categorySlug, id } })
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setDuplicating(null)
    }
  }

  return { duplicate, duplicating, error }
}
