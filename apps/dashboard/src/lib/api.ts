const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export function getSessionToken(): string | null {
  return localStorage.getItem('session_token')
}

export function setSessionToken(token: string): void {
  localStorage.setItem('session_token', token)
}

export function clearSessionToken(): void {
  localStorage.removeItem('session_token')
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getSessionToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...init?.headers as Record<string, string>
  }
  
  // Add Authorization header if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const r = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include', // Still try cookies as fallback
    headers
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(text || `API ${r.status}: ${path}`)
  }
  return r.json() as Promise<T>
}
