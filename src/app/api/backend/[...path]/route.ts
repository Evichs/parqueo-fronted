import { NextRequest, NextResponse } from 'next/server';

function getBackendBaseUrl(): string {
  const envUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://parqueos-api.onrender.com/api';
  const clean = envUrl.replace(/\/$/, '');
  if (!clean.endsWith('/api') && !clean.includes('/api/')) {
    return `${clean}/api`;
  }
  return clean;
}

// ==========================================
// CACHÉ EN MEMORIA PARA EVITAR SOBRECARGA EN RENDER FREE TIER
// TTL corto (12s) para máxima fluidez en navegación.
// Se auto-invalida inmediatamente ante cualquier POST, PUT, DELETE o PATCH.
// ==========================================
interface CacheEntry {
  data: any;
  status: number;
  expiresAt: number;
}
const memoryCache = new Map<string, CacheEntry>();

function getCached(key: string): CacheEntry | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry;
}

function setCached(key: string, data: any, status: number, ttlSeconds = 12) {
  memoryCache.set(key, {
    data,
    status,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function clearCache() {
  memoryCache.clear();
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path, 'DELETE');
}

async function handleProxy(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  const baseUrl = getBackendBaseUrl();
  const path = pathSegments.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${baseUrl}/${path}${search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let body: string | undefined = undefined;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    // Al mutar cualquier dato, se vacía la caché de inmediato
    clearCache();
    try {
      const text = await request.text();
      if (text && text.trim().length > 0) {
        body = text;
      }
    } catch {
      // sin body
    }
  }

  // Verificación de caché en memoria para peticiones GET (0ms respuesta)
  const cacheKey = `${method}:${targetUrl}`;
  const noCache = request.headers.get('cache-control') === 'no-cache';
  if (method === 'GET' && !noCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached.data, {
        status: cached.status,
        headers: { 'X-Cache': 'HIT' },
      });
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // El backend omite GET /api/espacios (solo expone /espacios/disponibles y /espacios/:id).
    // Reconstruimos la lista completa de espacios reales si /espacios devuelve 404.
    if (backendRes.status === 404 && path === 'espacios' && method === 'GET') {
      try {
        const dispRes = await fetch(`${baseUrl}/espacios/disponibles`, { headers })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []);

        // Escanear los IDs en lote (1..15)
        const idPromises = Array.from({ length: 15 }, (_, i) =>
          fetch(`${baseUrl}/espacios/${i + 1}`, { headers })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)
        );
        const idResults = await Promise.all(idPromises);

        const mapa = new Map<number, any>();
        idResults.forEach((item) => {
          if (item && item.id) {
            mapa.set(item.id, {
              ...item,
              numero_identificador: item.numero_identificador || `C-${item.id}`,
            });
          }
        });

        if (Array.isArray(dispRes)) {
          dispRes.forEach((item: any) => {
            if (item && item.id) {
              const exist = mapa.get(item.id) || {};
              mapa.set(item.id, {
                ...exist,
                ...item,
                numero_identificador:
                  item.numero_identificador || exist.numero_identificador || `C-${item.id}`,
              });
            }
          });
        }

        const todosEspacios = Array.from(mapa.values()).sort((a, b) => a.id - b.id);
        setCached(cacheKey, todosEspacios, 200, 15);
        return NextResponse.json(todosEspacios, { status: 200 });
      } catch (err: any) {
        console.error('Error ensamblando espacios en proxy:', err.message);
      }
    }

    // El backend omite GET /api/niveles-parqueo (solo expone /niveles-parqueo/sucursal/:id).
    // Extraemos todos los niveles de las sucursales si /niveles-parqueo devuelve 404.
    if (backendRes.status === 404 && path === 'niveles-parqueo' && method === 'GET') {
      try {
        const sucRes = await fetch(`${baseUrl}/sucursales`, { headers });
        if (sucRes.ok) {
          const sucursales = await sucRes.json();
          const niveles: any[] = [];
          if (Array.isArray(sucursales)) {
            sucursales.forEach((s: any) => {
              if (Array.isArray(s.niveles_parqueo)) {
                s.niveles_parqueo.forEach((n: any) => {
                  niveles.push({
                    ...n,
                    sucursal: { id: s.id, nombre: s.nombre },
                  });
                });
              }
            });
          }
          setCached(cacheKey, niveles, 200, 20);
          return NextResponse.json(niveles, { status: 200 });
        }
      } catch (err: any) {
        console.error('Error ensamblando niveles en proxy:', err.message);
      }
    }

    const contentType = backendRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      if (method === 'GET' && backendRes.status === 200) {
        setCached(cacheKey, data, 200, 12);
      }
      return NextResponse.json(data, {
        status: backendRes.status,
      });
    }

    const text = await backendRes.text();
    return new NextResponse(text, {
      status: backendRes.status,
      headers: { 'Content-Type': contentType || 'text/plain' },
    });
  } catch (error: any) {
    console.error(`Error de conexión hacia API (${targetUrl}):`, error.message);
    return NextResponse.json(
      {
        statusCode: 504,
        message: `El backend (${targetUrl}) no respondió: ${error.message}`,
        error: 'Gateway Timeout',
      },
      { status: 504 }
    );
  }
}
