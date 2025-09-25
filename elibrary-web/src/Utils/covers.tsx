// src/utils/covers.ts
// Fetch cover images at runtime (no downloads) with smart fallbacks + manual overrides.

type BookLite = { title: string; author: string }

const cache = new Map<string, string | null>()

function norm(s: string) {
  return s.trim().toLowerCase()
}
function keyOf(b: BookLite) {
  return `${norm(b.title)}|${norm(b.author)}`
}

// Neutral inline placeholder (no file needed)
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='480'>
      <rect width='100%' height='100%' fill='#e5e7eb'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            font-family='Arial' font-size='22' fill='#6b7280'>No Cover</text>
    </svg>`
  )

/** Manual overrides for stubborn titles (key is "<title>|<author>" lowercased). */
const overrides: Record<string, string> = {
  // Your two non-real seed books:
  "the great novel|a. writer": PLACEHOLDER,
  "galactic routes|s. voyager": PLACEHOLDER,

  // If any other book fails, add it here:
  // "some title|some author": "https://covers.openlibrary.org/b/id/XXXX-L.jpg"
}

async function getJSON(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(String(res.status))
  return res.json()
}

function olCoverFromDoc(doc: any, size: "S" | "M" | "L" = "M"): string | null {
  if (doc?.cover_i) return `https://covers.openlibrary.org/b/id/${doc.cover_i}-${size}.jpg`
  const isbn = doc?.isbn?.[0]
  if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`
  return null
}

/**
 * Get a cover URL for a book using:
 * 1) Manual override
 * 2) Open Library query by "title author" (q)
 * 3) Open Library query by separate title & author
 * 4) Open Library title only
 * 5) Google Books images (no key)
 * Returns null if nothing found.
 */
export async function getCoverUrl(b: BookLite): Promise<string | null> {
  const k = keyOf(b)
  if (cache.has(k)) return cache.get(k) ?? null

  // (0) Manual override
  if (overrides[k]) {
    cache.set(k, overrides[k])
    return overrides[k]
  }

  // (1) Open Library: one query string
  try {
    const q = encodeURIComponent(`${b.title} ${b.author}`)
    const data = await getJSON(`https://openlibrary.org/search.json?q=${q}&limit=1`)
    const url = olCoverFromDoc(data?.docs?.[0], "L") || olCoverFromDoc(data?.docs?.[0], "M")
    if (url) { cache.set(k, url); return url }
  } catch {}

  // (2) Open Library: separate title+author
  try {
    const t = encodeURIComponent(b.title)
    const a = encodeURIComponent(b.author)
    const data = await getJSON(`https://openlibrary.org/search.json?title=${t}&author=${a}&limit=1`)
    const url = olCoverFromDoc(data?.docs?.[0], "L") || olCoverFromDoc(data?.docs?.[0], "M")
    if (url) { cache.set(k, url); return url }
  } catch {}

  // (3) Open Library: title only
  try {
    const t = encodeURIComponent(b.title)
    const data = await getJSON(`https://openlibrary.org/search.json?title=${t}&limit=1`)
    const url = olCoverFromDoc(data?.docs?.[0], "L") || olCoverFromDoc(data?.docs?.[0], "M")
    if (url) { cache.set(k, url); return url }
  } catch {}

  // (4) Google Books (no key)
  try {
    const t = encodeURIComponent(b.title)
    const a = encodeURIComponent(b.author)
    const data = await getJSON(`https://www.googleapis.com/books/v1/volumes?q=intitle:${t}+inauthor:${a}&maxResults=1`)
    const img = data?.items?.[0]?.volumeInfo?.imageLinks
    const url = (img?.thumbnail || img?.smallThumbnail || null)?.replace(/^http:\/\//, 'https://') ?? null
    if (url) { cache.set(k, url); return url }
  } catch {}

  cache.set(k, null)
  return null
}
