<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900">
        <svg v-if="!error" class="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 v-if="!error" class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Signing you in...
      </h2>
      <h2 v-else class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Authentication Failed
      </h2>
      <p v-if="error" class="text-gray-600 dark:text-gray-300">
        {{ error }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const localePath = useLocalePath()

const token = useCookie('auth_token', { 
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax'
})
const user = useState('user')
const error = ref('')

onMounted(async () => {
  // Get token from query params
  const tokenFromQuery = route.query.token as string
  const errorFromQuery = route.query.error as string

  if (errorFromQuery) {
    error.value = errorFromQuery
    // Redirect to login after showing error
    setTimeout(() => {
      navigateTo(localePath('/login'))
    }, 3000)
    return
  }

  if (tokenFromQuery) {
    // Store the token
    token.value = tokenFromQuery
    
    // Fetch user profile
    try {
      const config = useRuntimeConfig()
      const response = await $fetch(`${config.public.apiBase}/api/v1/auth/profile`, {
        headers: {
          Authorization: `Bearer ${tokenFromQuery}`
        }
      })
      
      user.value = response.user
      
      // Redirect to dashboard
      await navigateTo(localePath('/dashboard'))
    } catch (err: any) {
      error.value = 'Failed to fetch user profile'
      setTimeout(() => {
        navigateTo(localePath('/login'))
      }, 3000)
    }
  } else {
    error.value = 'No authentication token received'
    setTimeout(() => {
      navigateTo(localePath('/login'))
    }, 3000)
  }
})
</script>

