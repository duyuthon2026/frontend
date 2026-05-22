import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const distRoot = path.join(projectRoot, 'dist')
const indexPath = path.join(distRoot, 'index.html')

await assertFile(indexPath, 'dist/index.html')
await assertFile(path.join(distRoot, 'sw.js'), 'dist/sw.js')
await assertFile(path.join(distRoot, 'manifest.webmanifest'), 'dist/manifest.webmanifest')

const indexHtml = await readFile(indexPath, 'utf8')
const manifest = JSON.parse(
  await readFile(path.join(distRoot, 'manifest.webmanifest'), 'utf8'),
)

const server = createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400).end('Bad request')
    return
  }

  const url = new URL(request.url, 'http://127.0.0.1')
  const route = await resolveStaticRoute(url.pathname)

  if (route.status !== 200) {
    response.writeHead(route.status, getTextHeaders())
    response.end(route.message)
    return
  }

  const targetPath = route.filePath
  const body = await readFile(targetPath)

  response.writeHead(200, getHeadersForPath(targetPath))
  response.end(body)
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

try {
  const { port } = server.address()
  const origin = `http://127.0.0.1:${port}`

  await assertResponse(origin, '/', 'text/html')
  await assertResponse(origin, '/inventory', 'text/html')
  await assertResponse(origin, '/lens/camera-check', 'text/html')
  await assertResponse(origin, '/manifest.webmanifest', 'application/manifest+json')
  await assertResponse(origin, '/sw.js', 'text/javascript')
  await assertHeader(origin, '/', 'permissions-policy', 'camera=(self)')
  await assertHeader(origin, '/sw.js', 'cache-control', 'no-cache')
  await assertHeader(origin, '/sw.js', 'service-worker-allowed', '/')
  await assertStatus(origin, '/api/health', 404)
  await assertStatus(origin, '/assets/missing-production-smoke.js', 404)

  for (const assetPath of getIndexAssetPaths(indexHtml)) {
    await assertResponse(origin, assetPath)
  }

  for (const iconPath of getManifestIconPaths(manifest)) {
    await assertResponse(origin, iconPath)
  }

  console.info('Production dist verification passed.')
  console.info('- SPA fallback returns index.html for deep links.')
  console.info('- API routes and missing static assets are not rewritten to the SPA shell.')
  console.info('- PWA manifest, service worker, and referenced assets are reachable.')
  console.info('- Reference backend headers include service worker scope, no-cache for sw.js, and camera Permissions-Policy.')
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}

async function assertFile(filePath, label) {
  if (!await isFile(filePath)) {
    throw new Error(`${label} is missing. Run bun run build first.`)
  }
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile()
  } catch {
    return false
  }
}

async function resolveStaticRoute(urlPathname) {
  const decodedPathname = safeDecodePathname(urlPathname)
  if (!decodedPathname) {
    return { status: 400, message: 'Malformed URL path' }
  }

  if (decodedPathname.startsWith('/api/')) {
    return { status: 404, message: 'API routes are handled by the backend, not SPA fallback' }
  }

  const relativePath = decodedPathname.replace(/^\/+/, '') || 'index.html'
  const candidate = path.resolve(distRoot, relativePath)

  if (!candidate.startsWith(`${distRoot}${path.sep}`) && candidate !== distRoot) {
    return { status: 404, message: 'Not found' }
  }

  if (await isFile(candidate)) {
    return { status: 200, filePath: candidate }
  }

  if (isSpaPath(decodedPathname)) {
    return { status: 200, filePath: indexPath }
  }

  return { status: 404, message: 'Not found' }
}

function safeDecodePathname(urlPathname) {
  try {
    return decodeURIComponent(urlPathname)
  } catch {
    return null
  }
}

function isSpaPath(urlPathname) {
  const finalSegment = urlPathname.split('/').pop() || ''

  return !finalSegment.includes('.')
}

function getTextHeaders() {
  return {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
  }
}

function getHeadersForPath(filePath) {
  const relativePath = path.relative(distRoot, filePath)
  const normalizedPath = relativePath.split(path.sep).join('/')
  const headers = {
    'Content-Type': getContentType(normalizedPath),
    'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
  }

  if (normalizedPath === 'index.html' || normalizedPath === 'sw.js') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  } else if (normalizedPath.startsWith('assets/')) {
    headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  } else {
    headers['Cache-Control'] = 'public, max-age=3600'
  }

  if (normalizedPath === 'sw.js') {
    headers['Service-Worker-Allowed'] = '/'
  }

  return headers
}

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.webmanifest')) return 'application/manifest+json; charset=utf-8'
  if (filePath.endsWith('.svg')) return 'image/svg+xml; charset=utf-8'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.ico')) return 'image/x-icon'
  return 'application/octet-stream'
}

async function assertResponse(origin, urlPathname, expectedContentType) {
  const response = await fetch(`${origin}${urlPathname}`)
  if (!response.ok) {
    throw new Error(`${urlPathname} returned ${response.status}`)
  }

  if (expectedContentType) {
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes(expectedContentType)) {
      throw new Error(`${urlPathname} content-type ${contentType} does not include ${expectedContentType}`)
    }
  }
}

async function assertHeader(origin, urlPathname, headerName, expectedValue) {
  const response = await fetch(`${origin}${urlPathname}`)
  const headerValue = response.headers.get(headerName) || ''

  if (!headerValue.includes(expectedValue)) {
    throw new Error(`${urlPathname} ${headerName}=${headerValue}; expected ${expectedValue}`)
  }
}

async function assertStatus(origin, urlPathname, expectedStatus) {
  const response = await fetch(`${origin}${urlPathname}`)

  if (response.status !== expectedStatus) {
    throw new Error(`${urlPathname} returned ${response.status}; expected ${expectedStatus}`)
  }
}

function getIndexAssetPaths(html) {
  const assetPaths = new Set()
  const assetPattern = /(?:src|href)="([^"]+)"/g
  let match = assetPattern.exec(html)

  while (match) {
    const assetPath = match[1]
    if (assetPath.startsWith('/')) {
      assetPaths.add(assetPath)
    }
    match = assetPattern.exec(html)
  }

  return assetPaths
}

function getManifestIconPaths(value) {
  if (!value || !Array.isArray(value.icons)) return []

  return value.icons
    .map((icon) => icon?.src)
    .filter((src) => typeof src === 'string' && src.startsWith('/'))
}
