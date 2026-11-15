import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  let filename = searchParams.get('filename') || 'image.webp';

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Security check: only allow http or https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return new NextResponse('Invalid URL protocol', { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new NextResponse(`Failed to fetch media: ${res.statusText}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    if (!filename.includes('.')) {
      if (contentType.includes('webp')) filename += '.webp';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) filename += '.jpg';
      else if (contentType.includes('png')) filename += '.png';
      else if (contentType.includes('mp4')) filename += '.mp4';
    }

    // Sanitize filename for header
    const cleanFilename = filename.replace(/[/\\?%*:|"<>]/g, '-');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Download proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
