export async function verifyGitHubSignature(payload: string, sig: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(payload))
  const expected = "sha256=" + [...new Uint8Array(mac)].map(b => b.toString(16).padStart(2, "0")).join("")
  return timingSafe(expected, sig)
}
export async function verifyHmac(payload: string, sig: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(payload))
  const computed = btoa(String.fromCharCode(...new Uint8Array(mac)))
  return timingSafe(computed, sig)
}
function timingSafe(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}
