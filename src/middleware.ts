import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { canAccessRoute, getFeatureKeyFromRoute, type FeatureKey, ROLE_DEFAULT_FEATURES, type UserRole } from '@/lib/auth/permissions'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/auth/accept-invitation', '/auth/setup-admin', '/commercial/new-project-intake']

  // Get current user (skip for public intake route to allow anonymous submissions)
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check feature-based access for authenticated users
  if (user && !isPublicRoute) {
    // Get user role and check if active
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    // If user doesn't have a role or is inactive, redirect to login
    if (!userRole || !userRole.is_active) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get user's enabled features
    const { data: userFeatures, error: featuresError } = await supabase
      .from('user_feature_access')
      .select('feature_key')
      .eq('user_id', user.id)
      .eq('is_enabled', true)

    // If feature table doesn't exist yet or query fails, allow access
    // This provides backward compatibility during migration
    if (featuresError) {
      console.warn('Feature access table not available, allowing access:', featuresError.message)
      return response
    }

    const enabledFeatures = (userFeatures || []).map(f => f.feature_key as FeatureKey)

    // If user has no features assigned yet, allow access to dashboard
    if (enabledFeatures.length === 0 && pathname === '/dashboard') {
      return response
    }

    // Check if user can access this route based on their features
    if (enabledFeatures.length > 0 && !canAccessRoute(enabledFeatures, pathname)) {
      // Redirect to dashboard if they don't have access
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}