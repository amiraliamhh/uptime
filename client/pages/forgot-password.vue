<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
    <!-- Header -->
    <AuthHeader />

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full space-y-8">
        <!-- Title -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
            <svg class="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('auth.forgot.title') }}
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-300">
            {{ $t('auth.forgot.subtitle') }}
          </p>
        </div>

        <!-- Form -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <!-- Success Message -->
          <div
            v-if="submitted"
            class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
          >
            <p class="text-sm text-green-800 dark:text-green-400">
              {{ $t('auth.forgot.success') }}
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error && !submitted" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <form v-if="!submitted" @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ $t('auth.forgot.email') }}
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

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Sending...</span>
              <span v-else>{{ $t('auth.forgot.button') }}</span>
            </button>
          </form>

          <!-- Back to Login -->
          <div class="mt-6 text-center">
            <NuxtLink :to="localePath('/login')" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center justify-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ $t('auth.forgot.back_to') }} {{ $t('auth.forgot.login') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Additional Help -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800 dark:text-blue-400">
                If you don't receive an email within a few minutes, check your spam folder or try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const localePath = useLocalePath()
const { forgotPassword } = useAuth()

const form = ref({
  email: ''
})

const loading = ref(false)
const error = ref('')
const submitted = ref(false)

const handleSubmit = async () => {
  if (loading.value) return
  
  error.value = ''
  loading.value = true

  try {
    const result = await forgotPassword(form.value.email)

    if (result.success) {
      submitted.value = true
    } else {
      error.value = result.error
    }
  } finally {
    loading.value = false
  }
}
</script>

