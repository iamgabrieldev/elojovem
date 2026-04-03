type Entry = { count: number; windowStart: number };

const store = new Map<string, Entry>();

/** Janela fixa em memória (MVP). Em produção usar Redis. */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { ok: true };
  }

  if (entry.count >= max) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { ok: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  entry.count += 1;
  return { ok: true };
}
