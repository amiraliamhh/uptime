<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
    <!-- Header -->
    <AuthHeader />

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full space-y-8">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
            <svg class="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verifying Email...
          </h2>
          <p class="text-gray-600 dark:text-gray-300">
            Please wait while we verify your email address.
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg class="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Failed
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            {{ error }}
          </p>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <NuxtLink 
              :to="localePath('/login')" 
              class="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg inline-flex items-center justify-center"
            >
              Go to Login
            </NuxtLink>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg class="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h2>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Your email address has been successfully verified. You will be redirected to the dashboard in {{ countdown }} seconds.
          </p>
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div class="mb-4">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                  :style="{ width: `${(countdown / 5) * 100}%` }"
                ></div>
              </div>
            </div>
            <NuxtLink 
              :to="localePath('/dashboard')" 
              class="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg inline-flex items-center justify-center"
            >
              Go to Dashboard Now
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const localePath = useLocalePath()
const { verifyEmail } = useAuth()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const countdown = ref(5)
let countdownInterval: ReturnType<typeof setInterval> | null = null

// Get token from query parameter
const token = computed(() => route.query.token as string)

// Verify email on mount
onMounted(async () => {
  if (!token.value) {
    error.value = 'Verification token is missing. Please check your email and try again.'
    loading.value = false
    return
  }

  try {
    const result = await verifyEmail(token.value)
    
    if (result.success) {
      success.value = true
      loading.value = false
      
      // Start countdown
      countdownInterval = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          if (countdownInterval) {
            clearInterval(countdownInterval)
            countdownInterval = null
          }
          navigateTo(localePath('/dashboard'))
        }
      }, 1000)
    } else {
      error.value = result.error || 'Failed to verify email address'
      loading.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred while verifying your email'
    loading.value = false
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

