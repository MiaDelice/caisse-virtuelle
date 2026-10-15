const PUBLIC_ROUTES = new Set(['/login', '/reset-password'])

export default defineNuxtRouteMiddleware((to) => {
  const session = useSupabaseSession()
  const authUserStore = useAuthUserStore()

  authUserStore.hydrateFromSession(session.value)

  const isPublicRoute = PUBLIC_ROUTES.has(to.path)

  if (!authUserStore.authenticatedUser && !isPublicRoute) {
    return navigateTo('/login')
  }

  if (authUserStore.authenticatedUser && isPublicRoute) {
    return navigateTo('/caisse')
  }
})
