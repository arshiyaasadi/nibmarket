import type { NetworkSubset, NetworkTreeNode } from "@/types/mlm";

/** Max nodes rendered in the org chart (performance + readability). */
export const NETWORK_TREE_MAX_NODES = 80;

export type NetworkSubsetTreeResult = {
  roots: NetworkTreeNode[];
  truncated: boolean;
};

export type NetworkTreeCurrentUser = {
  id: string;
  fullName: string;
};

function sortTreeNodes(nodes: NetworkTreeNode[]): void {
  nodes.sort((a, b) => a.level - b.level || a.fullName.localeCompare(b.fullName, "fa"));
  nodes.forEach((node) => {
    if (node.children?.length) sortTreeNodes(node.children);
  });
}

export function buildNetworkTreeFromSubsets(rows: NetworkSubset[]): NetworkTreeNode[] {
  if (rows.length === 0) return [];

  const idSet = new Set(rows.map((row) => row.id));
  const nodeMap = new Map<string, NetworkTreeNode>();

  for (const row of rows) {
    nodeMap.set(row.id, {
      id: row.id,
      fullName: row.fullName,
      level: row.level,
      isSelf: false,
      children: [],
    });
  }

  const roots: NetworkTreeNode[] = [];

  for (const row of rows) {
    const node = nodeMap.get(row.id);
    if (!node) continue;

    const parentId = row.directParentUserId;
    const parent = parentId ? nodeMap.get(parentId) : undefined;

    if (parent && idSet.has(parentId!)) {
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  sortTreeNodes(roots);

  return roots;
}

export function limitNetworkTree(
  roots: NetworkTreeNode[],
  maxNodes = NETWORK_TREE_MAX_NODES,
): { roots: NetworkTreeNode[]; truncated: boolean } {
  let count = 0;
  let truncated = false;

  const trim = (node: NetworkTreeNode): NetworkTreeNode | null => {
    if (count >= maxNodes) {
      truncated = true;
      return null;
    }

    count += 1;
    const children: NetworkTreeNode[] = [];

    for (const child of node.children ?? []) {
      const kept = trim(child);
      if (kept) children.push(kept);
      if (count >= maxNodes && children.length < (node.children?.length ?? 0)) {
        truncated = true;
        break;
      }
    }

    return { ...node, children };
  };

  const limited: NetworkTreeNode[] = [];
  for (const root of roots) {
    const kept = trim(root);
    if (kept) limited.push(kept);
    if (count >= maxNodes) break;
  }

  return { roots: limited, truncated };
}

/** Put the authenticated user on top; API rows are only subordinates. */
export function wrapWithCurrentUserRoot(
  forestRoots: NetworkTreeNode[],
  currentUser: NetworkTreeCurrentUser | null,
): NetworkTreeNode | null {
  if (forestRoots.length === 0 && !currentUser) return null;

  if (!currentUser) {
    if (forestRoots.length === 1) return forestRoots[0];

    return {
      id: "network-root",
      fullName: "شبکه من",
      level: 0,
      isSelf: false,
      children: forestRoots,
    };
  }

  return {
    id: currentUser.id,
    fullName: currentUser.fullName.trim() || "شما",
    level: 0,
    isSelf: true,
    children: forestRoots,
  };
}

/** Same rows as GET /network/subsets → org chart roots. */
export function buildSubsetTreeFromSubsets(rows: NetworkSubset[]): NetworkSubsetTreeResult {
  const builtRoots = buildNetworkTreeFromSubsets(rows);
  const { roots, truncated } = limitNetworkTree(builtRoots);

  return { roots, truncated };
}
