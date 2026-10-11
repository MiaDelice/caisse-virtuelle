import { jwtDecode } from 'jwt-decode'

export type UserRole = 'SELLER' | 'MANAGER'

interface AccessTokenClaims {
  sub: string
  user_role?: UserRole
  user_first_name?: string
  user_last_name?: string
}

interface AuthenticatedUser {
  id: string
  email: string | null
  firstName: string
  lastName: string
  role: UserRole
}

export const useAuthUserStore = defineStore('authUser', () => {
  const authenticatedUser = ref<AuthenticatedUser | null>(null)

  function hydrateFromSession(session: { access_token: string; user: { email?: string | null } } | null) {
    if (!session) {
      authenticatedUser.value = null
      return
    }

    const claims = jwtDecode<AccessTokenClaims>(session.access_token)

    if (!claims.user_role || !claims.user_first_name || !claims.user_last_name) {
      authenticatedUser.value = null
      return
    }

    authenticatedUser.value = {
      id: claims.sub,
      email: session.user.email ?? null,
      firstName: claims.user_first_name,
      lastName: claims.user_last_name,
      role: claims.user_role
    }
  }

  function clear() {
    authenticatedUser.value = null
  }

  return { authenticatedUser, hydrateFromSession, clear }
})
