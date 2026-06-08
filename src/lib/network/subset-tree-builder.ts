import type { NetworkSubsetRow, NetworkTreeNode } from 'src/types/api/network'

/** Max nodes rendered in the org chart (performance + readability). */
export const NETWORK_TREE_MAX_NODES = 80

function sortTreeNodes(nodes: NetworkTreeNode[]): void {
  nodes.sort((a, b) => a.level - b.level || a.fullName.localeCompare(b.fullName, 'fa'))
  nodes.forEach(node => sortTreeNodes(node.children))
}

export function buildNetworkTreeFromSubsetRows(rows: NetworkSubsetRow[]): NetworkTreeNode[] {
  if (rows.length === 0) return []

  const idSet = new Set(rows.map(row => row.id))
  const nodeMap = new Map<number, NetworkTreeNode>()

  for (const row of rows) {
    nodeMap.set(row.id, {
      id: String(row.id),
      firstName: row.firstName,
      lastName: row.lastName,
      fullName: row.fullName,
      level: row.level,
      children: []
    })
  }

  const roots: NetworkTreeNode[] = []

  for (const row of rows) {
    const node = nodeMap.get(row.id)
    if (!node) continue

    const parent = nodeMap.get(row.directParentUserId)
    if (parent && idSet.has(row.directParentUserId)) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  sortTreeNodes(roots)

  return roots
}

export function limitNetworkTree(
  roots: NetworkTreeNode[],
  maxNodes = NETWORK_TREE_MAX_NODES
): { roots: NetworkTreeNode[]; truncated: boolean } {
  let count = 0
  let truncated = false

  const trim = (node: NetworkTreeNode): NetworkTreeNode | null => {
    if (count >= maxNodes) {
      truncated = true

      return null
    }

    count += 1
    const children: NetworkTreeNode[] = []

    for (const child of node.children) {
      const kept = trim(child)
      if (kept) children.push(kept)
      if (count >= maxNodes && children.length < node.children.length) {
        truncated = true
        break
      }
    }

    return { ...node, children }
  }

  const limited: NetworkTreeNode[] = []
  for (const root of roots) {
    const kept = trim(root)
    if (kept) limited.push(kept)
    if (count >= maxNodes) break
  }

  return { roots: limited, truncated }
}
