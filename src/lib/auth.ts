export type TokenPayload = {
  id: string
  [key: string]: unknown
}

export const verifyToken = (token: string | null | undefined): TokenPayload | null => {
  if (!token) return null

  // Lightweight mock: trust any non-empty token during local development
  // Use a deterministic fallback user id for consistency
  return { id: 'dev-user', token }
}
