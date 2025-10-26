export const useAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token', { 
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  })
  const user = useState('user', () => null as any)

  const signup = async (data: { email: string; password: string; name?: string }) => {
    try {
      const response = await $fetch(`${config.public.apiBase}/api/v1/auth/signup`, {
        method: 'POST',
        body: data
      })

      if (response.token) {
        token.value = response.token
        user.value = response.user
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
      const response = await $fetch(`${config.public.apiBase}/api/v1/auth/login`, {
        method: 'POST',
        body: data
      })

      if (response.token) {
        token.value = response.token
        user.value = response.user
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
      const response = await $fetch(`${config.public.apiBase}/api/v1/auth/forgot-password`, {
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
  }

  const fetchProfile = async () => {
    if (!token.value) return

    try {
      const response = await $fetch(`${config.public.apiBase}/api/v1/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      user.value = response.user
      return { success: true, data: response }
    } catch (error: any) {
      // Token might be invalid
      if (error.status === 401) {
        logout()
      }
      return { success: false, error: error.data?.error || 'Failed to fetch profile' }
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  return {
    signup,
    login,
    forgotPassword,
    logout,
    fetchProfile,
    isAuthenticated,
    user: readonly(user),
    token: readonly(token)
  }
}

