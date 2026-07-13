function stableObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableObject)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, stableObject(item)]),
    )
  }
  return value
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(stableObject(value))
}

export async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', encoded)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function deterministicId(prefix: string, value: unknown): Promise<string> {
  const hash = await sha256Hex(stableStringify(value))
  return `${prefix}_${hash.slice(0, 20)}`
}
