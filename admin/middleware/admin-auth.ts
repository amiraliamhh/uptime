export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, fetchProfile } = useAdminAuth()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo('/')
  }

  // Try to fetch profile to verify token is still valid
  const result = await fetchProfile()
  if (!result.success) {
    // Token is invalid, redirect to login
    return navigateTo('/')
  }
})

