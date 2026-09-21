/**
 * Local persistence helper.
 * In production these reads/writes move to the API layer; the keys, shapes and
 * versioning stay the same so migration is straightforward.
 */

const NS = 'labcare.demo.v1'

export const StorageKeys = {
  packages: `${NS}.packages`,
  bookings: `${NS}.bookings`,
  session: `${NS}.session`,
  draft: `${NS}.booking-draft`,
  customerProfile: `${NS}.customer-profile`,
  seededAt: `${NS}.seeded-at`,
  /** Admin console: is the desktop sidebar hidden? Presentation preference. */
  adminNavHidden: `${NS}.admin-nav-hidden`,
} as const

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage may be unavailable (private mode / iframe sandbox) — demo continues in memory */
  }
}

export function removeKey(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Wipe all demo state so the app returns to its seeded story. */
export function resetDemoStorage() {
  Object.values(StorageKeys).forEach(removeKey)
}
