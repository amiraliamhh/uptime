export const useAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token', { 
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  })
  const user = useState('user', () => null as any)
  const limits = useState('limits', () => null as {
    maxOrganizationsPerUser: number
    organizationsRemaining: number
    maxMonitorsPerOrganization: number
  } | null)

  const signup = async (data: { email: string; password: string; name?: string }) => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/auth/signup`, {
        method: 'POST',
        body: data
      })

      if (response.token) {
        token.value = response.token
        user.value = response.user
        limits.value = response.limits || null
      }

      return { success: true, data: response }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.data?.error || error.message || 'Signup failed' 
      }
    }
  }

  const login = async (data: { email: string; password: string }) => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        body: data
      })

      if (response.token) {
        token.value = response.token
        user.value = response.user
        limits.value = response.limits || null
      }

      return { success: true, data: response }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.data?.error || error.message || 'Login failed' 
      }
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/auth/forgot-password`, {
        method: 'POST',
        body: { email }
      })

      return { success: true, data: response }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.data?.error || error.message || 'Request failed' 
      }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    limits.value = null
  }

  const setToken = (newToken: string | null) => {
    token.value = newToken
  }

  const fetchProfile = async () => {
    if (!token.value) return

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      user.value = response.user
      limits.value = response.limits || null
      return { success: true, data: response }
    } catch (error: any) {
      // Log out on any profile request failure
      logout()
      return { success: false, error: error.data?.error || 'Failed to fetch profile' }
    }
  }

  const changePassword = async (data: { currentPassword?: string; password: string }) => {
    if (!token.value) return { success: false, error: 'Not authenticated' }

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: data
      })

      return { success: true, data: response }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.data?.error || error.message || 'Failed to change password' 
      }
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/auth/verify-email`, {
        method: 'POST',
        body: { token }
      })

      return { success: true, data: response }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.data?.error || error.message || 'Failed to verify email' 
      }
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  return {
    signup,
    login,
    forgotPassword,
    logout,
    setToken,
    fetchProfile,
    changePassword,
    verifyEmail,
    isAuthenticated,
    user: readonly(user),
    token: readonly(token),
    limits: readonly(limits)
  }
}

