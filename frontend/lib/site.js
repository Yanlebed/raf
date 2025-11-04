export function getSiteOrigin() {
  // For SSR/server components where relative fetch may fail
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}


