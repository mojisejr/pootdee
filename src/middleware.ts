import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoutes = createRouteMatcher([
  "/",              // Landing page
  "/studio(.*)",    // Studio routes (existing)
  "/auth(.*)",      // Authentication routes
  "/api/health",    // Health check endpoint
]);

// Define protected routes that require authentication
const isProtectedRoutes = createRouteMatcher([
  "/analyzer(.*)",  // Analyzer functionality
  "/api/analyze",   // Analysis API endpoint
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoutes(req)) {
    return;
  }

  // Protect specific routes that require authentication
  if (isProtectedRoutes(req)) {
    await auth.protect();
    return;
  }

  // Default behavior: protect all other routes
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
