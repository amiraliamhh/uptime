<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-indigo-600">
              {{ $t('nav.brand') }}
            </NuxtLink>
            <a href="https://9headache.com" target="_blank">
              <img src="/logos/9headache.svg" alt="9headache" class="ml-2 h-8 align-self-bottom" />
            </a>
            <span class="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">Beta</span>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-md w-full space-y-8">
        <!-- Title -->
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900">
            {{ $t('auth.forgot.title') }}
          </h2>
          <p class="mt-2 text-gray-600">
            {{ $t('auth.forgot.subtitle') }}
          </p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <!-- Success Message -->
          <div
            v-if="submitted"
            class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p class="text-sm text-green-800">
              {{ $t('auth.forgot.success') }}
            </p>
          </div>

          <form v-if="!submitted" @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('auth.forgot.email') }}
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              {{ $t('auth.forgot.button') }}
            </button>
          </form>

          <!-- Back to Login -->
          <div class="mt-6 text-center">
            <NuxtLink :to="localePath('/login')" class="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {{ $t('auth.forgot.back_to') }} {{ $t('auth.forgot.login') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Additional Help -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-blue-800">
                If you don't receive an email within a few minutes, check your spam folder or try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath()

const form = ref({
  email: ''
})

const submitted = ref(false)

const handleSubmit = () => {
  // Handle form submission
  console.log('Forgot password form submitted:', form.value)
  submitted.value = true
}
</script>

