export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  const localePath = useLocalePath()

  // If trying to access dashboard without being authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo(localePath('/login'))
  }
})

