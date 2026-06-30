// Minimal in-memory fixed-window rate limiter for sensitive endpoints.
// Keyed by client IP. Good enough to blunt brute-force / spam on a single
// instance; swap for a shared store (Redis) if the app is ever horizontally
// scaled.

const buckets = new Map()

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

/**
 * @param {object} opts
 * @param {number} opts.windowMs  Window length in milliseconds.
 * @param {number} opts.max       Max requests per IP per window.
 * @param {string} opts.name      Bucket namespace (per-route).
 */
export function rateLimit({ windowMs, max, name }) {
  return function rateLimiter(req, res, next) {
    const now = Date.now()
    const key = `${name}:${clientIp(req)}`
    const entry = buckets.get(key)

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfter))
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' })
    }

    entry.count += 1
    return next()
  }
}

// Periodically drop expired buckets so the map can't grow unbounded.
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key)
  }
}, 60_000).unref?.()
