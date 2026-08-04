import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'https://zenu-backend.onrender.com';

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const search = req.nextUrl.search ?? '';
  const backendUrl = `${BACKEND_URL}/api/${path}${search}`;

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  const backendRes = await fetch(backendUrl, {
    method: req.method,
    headers: {
      'content-type': req.headers.get('content-type') ?? 'application/json',
      'cookie': req.headers.get('cookie') ?? '',
    },
    body,
    cache: 'no-store',
  });

  const responseBody = await backendRes.arrayBuffer();

  const proxyRes = new NextResponse(responseBody, {
    status: backendRes.status,
    statusText: backendRes.statusText,
  });

  backendRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      const cleaned = value.replace(/;\s*SameSite=None/gi, '').replace(/;\s*Secure/gi, '');
      proxyRes.headers.append('set-cookie', cleaned);
    } else if (key.toLowerCase() === 'content-type') {
      proxyRes.headers.set('content-type', value);
    }
  });

  return proxyRes;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
