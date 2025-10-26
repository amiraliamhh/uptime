<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <AuthHeader />

    <!-- Main Content - Two Column Layout -->
    <div class="flex-1 flex">
      <!-- Left Side - Info Section -->
      <div class="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 p-12 flex-col">
        <div class="max-w-lg mt-8">
          <h1 class="text-5xl font-bold text-white mb-6">
            {{ $t('auth.login.title') }}
          </h1>
          <p class="text-xl text-indigo-100 mb-12">
            {{ $t('auth.login.subtitle') }}
          </p>
          
          <!-- Benefits List -->
          <div class="space-y-6">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="ml-4 text-lg text-indigo-50">{{ $t('auth.login.benefit1') }}</p>
            </div>
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="ml-4 text-lg text-indigo-50">{{ $t('auth.login.benefit2') }}</p>
            </div>
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="ml-4 text-lg text-indigo-50">{{ $t('auth.login.benefit3') }}</p>
            </div>
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="ml-4 text-lg text-indigo-50">{{ $t('auth.login.benefit4') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Form Section -->
      <div class="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div class="w-full max-w-md">
          <!-- Mobile Title -->
          <div class="lg:hidden mb-8 text-center">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ $t('auth.login.title') }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300">
              {{ $t('auth.login.subtitle') }}
            </p>
          </div>

          <!-- Form Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <!-- Error Message -->
            <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
            </div>

            <!-- Social Login -->
            <div class="space-y-3">
              <button
                type="button"
                @click="handleGoogleLogin"
                :disabled="loading"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{{ $t('auth.login.google') }}</span>
              </button>
              <button
                type="button"
                class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 dark:bg-gray-700 border border-gray-900 dark:border-gray-600 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="loading"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span>{{ $t('auth.login.github') }}</span>
              </button>
            </div>

            <!-- Divider -->
            <div class="my-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">{{ $t('auth.login.or') }}</span>
                </div>
              </div>
            </div>

            <!-- Email/Password Form -->
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('auth.login.email') }}
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <!-- Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {{ $t('auth.login.password') }}
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  required
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <!-- Remember & Forgot -->
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input
                    id="remember"
                    v-model="form.remember"
                    type="checkbox"
                    class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <label for="remember" class="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    {{ $t('auth.login.remember') }}
                  </label>
                </div>
                <NuxtLink :to="localePath('/forgot-password')" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                  {{ $t('auth.login.forgot') }}
                </NuxtLink>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading">Loading...</span>
                <span v-else>{{ $t('auth.login.button') }}</span>
              </button>
            </form>
          </div>

          <!-- Sign up link -->
          <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {{ $t('auth.login.no_account') }}
            <NuxtLink :to="localePath('/signup')" class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              {{ $t('auth.login.signup_link') }}
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const localePath = useLocalePath()
const { login, isAuthenticated } = useAuth()

// Redirect to dashboard if already authenticated
onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo(localePath('/dashboard'))
  }
})

const form = ref({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (loading.value) return
  
  error.value = ''
  loading.value = true

  try {
    const result = await login({
      email: form.value.email,
      password: form.value.password
    })

    if (result.success) {
      // Redirect to dashboard
      await navigateTo(localePath('/dashboard'))
    } else {
      error.value = result.error
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = () => {
  const config = useRuntimeConfig()
  window.location.href = `${config.public.apiBase}/api/v1/auth/google`
}
</script>
