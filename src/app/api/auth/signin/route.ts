import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const redirectUrl = new URL('/signin', request.url);
  return NextResponse.redirect(redirectUrl);
}

export function HEAD(request: NextRequest) {
  const redirectUrl = new URL('/signin', request.url);
  return NextResponse.redirect(redirectUrl);
}
