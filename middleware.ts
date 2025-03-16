export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    // Add routes that require authentication
    "/protected/:path*",
    "/dashboard/:path*"
  ]
} 