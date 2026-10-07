export default defineNuxtRouteMiddleware(() => {
  const authUserStore = useAuthUserStore()

  if (authUserStore.authenticatedUser?.role !== 'MANAGER') {
    return navigateTo('/')
  }
})
