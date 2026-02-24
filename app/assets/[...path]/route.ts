import { NextResponse } from 'next/server';

/**
 * Handle requests for non-existent asset files
 * These are often auto-requested by browsers, bookmarks, or PWA manifests
 * Returns 404 instead of 500 to prevent error logs
 */
export async function GET() {
  return new NextResponse(null, { status: 404 });
}



