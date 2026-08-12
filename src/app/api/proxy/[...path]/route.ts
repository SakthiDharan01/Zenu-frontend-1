import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.BACKEND_URL ?? 'https://zenu-backend-5dgz.onrender.com').replace(/\/$/, '');

/**
 * Forward-proxy to FastAPI.
 * Critical for OAuth: do NOT follow redirects — browser must receive Location
 * (e.g. accounts.google.com) and Set-Cookie from the API hop.
 */
async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const search = req.nextUrl.search ?? '';
  const backendUrl = `${BACKEND_URL}/${path}${search}`;

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();
  }

  const backendRes = await fetch(backendUrl, {
    method: req.method,
    headers: {
      'content-type': req.headers.get('content-type') ?? 'application/json',
      cookie: req.headers.get('cookie') ?? '',
      accept: req.headers.get('accept') ?? '*/*',
    },
    body,
    cache: 'no-store',
    redirect: 'manual',
  });

  const status = backendRes.status;
  const isRedirect = status >= 300 && status < 400;
  const isNoBodyStatus = status === 204 || status === 205 || status === 304 || isRedirect;

  const responseBody = isNoBodyStatus ? null : await backendRes.arrayBuffer();
  const proxyRes = new NextResponse(responseBody, {
    status,
    statusText: backendRes.statusText,
  });

  const location = backendRes.headers.get('location');
  if (location) {
    proxyRes.headers.set('location', location);
  }

  backendRes.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'set-cookie') {
      // Attach cookies to the Vercel host so credentialed browser calls keep working.
      const cleaned = value
        .replace(/;\s*Domain=[^;]*/gi, '')
        .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
        .replace(/;\s*Secure/gi, '');
      proxyRes.headers.append('set-cookie', cleaned);
    } else if (lower === 'content-type') {
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
