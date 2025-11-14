export const useAdminAuth = () => {
  const config = useRuntimeConfig()
  const token = useCookie('admin_token', { 
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  })
  const user = useState('admin_user', () => null as any)

  const login = async (data: { email: string; password: string }) => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/admin/auth/login`, {
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

  const logout = () => {
    token.value = null
    user.value = null
  }

  const fetchProfile = async () => {
    if (!token.value) return { success: false, error: 'No token' }

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/admin/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      user.value = response.user
      return { success: true, data: response }
    } catch (error: any) {
      // Log out on any profile request failure
      logout()
      return { success: false, error: error.data?.error || 'Failed to fetch profile' }
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  return {
    login,
    logout,
    fetchProfile,
    isAuthenticated,
    user: readonly(user),
    token: readonly(token)
  }
}

