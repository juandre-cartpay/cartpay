import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname (e.g. app.kwizapay.com or app.localhost:3000)
    const hostname = req.headers.get("host") || "";

    // Normalize hostname (remove port) for checking
    const hostnameNoPort = hostname.split(':')[0];

    // Define subdomains
    // Production: app.kwizapay.com -> app
    // Local: app.localhost -> app

    const subdomain = hostnameNoPort.split('.')[0];
    const isLocalhost = hostnameNoPort.includes('localhost');

    // Determine if it's the APP subdomain
    // If localhost (no sub), subdomain is 'localhost'.
    // If app.localhost, subdomain is 'app'.
    const isAppSubdomain = subdomain === 'app';
    // const isAdminSubdomain = subdomain === 'admin'; 

    const searchParams = req.nextUrl.searchParams.toString();
    // Get the path (e.g. /dashboard)
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
        }`;

    // Logic:
    // 1. If app subdomain -> Rewrite to /(app)
    // 2. If root domain (or www) -> Rewrite to /(site)

    let response: NextResponse;

    if (isAppSubdomain) {
        // Rewrite to the portal folder (previously app)
        response = NextResponse.rewrite(new URL(`/portal${path}`, req.url));
    } else {
        // Rewrite to the website folder (previously site)
        // This handles 'kwizapay.com', 'www.kwizapay.com', 'localhost'
        response = NextResponse.rewrite(new URL(`/website${path}`, req.url));
    }

    // Pass the rewrite response to Supabase middleware so it can attach cookies/refresh session on top of it
    return await updateSession(req, response);
}
