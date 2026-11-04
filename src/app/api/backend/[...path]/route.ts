import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://parqueos-api.onrender.com/api';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
  const path = pathSegments.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let body: string | undefined = undefined;
  if (method === 'POST' || method === 'PUT') {
    try {
      body = await request.text();
    } catch {
      // sin body
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

    const contentType = backendRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
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
    console.error(`Error de conexión hacia Render API (${targetUrl}):`, error.message);
    return NextResponse.json(
      {
        statusCode: 504,
        message: `El backend en Render no respondió a tiempo: ${error.message}`,
        error: 'Gateway Timeout',
      },
      { status: 504 }
    );
  }
}

