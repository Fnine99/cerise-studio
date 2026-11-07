// Resolves the public origin of the current request.
//
// Behind a proxy/load balancer (Vercel, etc.) the server receives the request
// on an internal host over http, so `request.nextUrl.origin` and `new URL(...)`
// can report the wrong host or protocol. The original public values survive in
// the `x-forwarded-*` headers, so we rebuild the origin from those.
export function originFromHeaders(headers: Headers): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");

  if (host) {
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    const proto = headers.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
    return `${proto}://${host}`;
  }

  // No host header at all (shouldn't happen for a real request): fall back to an
  // explicit site URL if configured, else local dev.
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
