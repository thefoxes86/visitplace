// Categories nest into subcategories through `parentId`: helpers to walk the tree.

/** What the tree needs of a category. */
type TreeNode = { id: string; parentId: string | null }

/**
 * Categories in menu order, each followed by its subcategories, with their depth (0 for top-level ones).
 * Expects them sorted by sortOrder, as the server sends them.
 */
export function categoryTree<T extends TreeNode>(categories: T[]): (T & { depth: number })[] {
  const ids = new Set(categories.map((c) => c.id))
  const seen = new Set<string>()
  const out: (T & { depth: number })[] = []
  const visit = (category: T, depth: number) => {
    if (seen.has(category.id)) return
    seen.add(category.id)
    out.push({ ...category, depth })
    for (const child of categories) if (child.parentId === category.id) visit(child, depth + 1)
  }
  // A category whose parent is missing shows at the top level rather than disappearing.
  for (const category of categories) if (!category.parentId || !ids.has(category.parentId)) visit(category, 0)
  return out
}

/** Ids of a category and of all its subcategories, at any depth. */
export function subtreeIds(categories: TreeNode[], id: string) {
  const ids = new Set([id])
  for (let grew = true; grew; ) {
    grew = false
    for (const c of categories) {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id)
        grew = true
      }
    }
  }
  return ids
}

/** A category and its parents, from the top-level one down. */
export function categoryPath<T extends TreeNode>(categories: T[], id: string): T[] {
  const path: T[] = []
  let current = categories.find((c) => c.id === id)
  while (current && !path.includes(current)) {
    path.unshift(current)
    const { parentId } = current
    current = categories.find((c) => c.id === parentId)
  }
  return path
}
