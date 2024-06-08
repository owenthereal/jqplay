import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    console.log(pathname)
    if (pathname.startsWith('/jq')) {
        // Create a new URL, removing '/jq' from the pathname and keeping query parameters
        const newUrl = new URL(`${pathname.replace('/jq', '/')}${search}`, req.url);
        return NextResponse.redirect(newUrl);
    }

    return NextResponse.next();
}
