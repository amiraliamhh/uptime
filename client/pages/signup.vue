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
          <h2 class="text-3xl font-bold text-gray-900">
            {{ $t('auth.signup.title') }}
          </h2>
          <p class="mt-2 text-gray-600">
            {{ $t('auth.signup.subtitle') }}
          </p>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Full Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('auth.signup.name') }}
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="John Doe"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('auth.signup.email') }}
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

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('auth.signup.password') }}
              </label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('auth.signup.confirm_password') }}
              </label>
              <input
                id="confirm_password"
                v-model="form.confirmPassword"
                type="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <!-- Terms & Privacy -->
            <div class="flex items-start">
              <input
                id="agree"
                v-model="form.agree"
                type="checkbox"
                required
                class="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
              />
              <label for="agree" class="ml-2 block text-sm text-gray-700 cursor-pointer">
                {{ $t('auth.signup.agree') }}
                <NuxtLink :to="localePath('/terms')" class="text-indigo-600 hover:text-indigo-700">
                  {{ $t('auth.signup.terms') }}
                </NuxtLink>
                {{ $t('auth.signup.and') }}
                <NuxtLink :to="localePath('/privacy')" class="text-indigo-600 hover:text-indigo-700">
                  {{ $t('auth.signup.privacy') }}
                </NuxtLink>
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              {{ $t('auth.signup.button') }}
            </button>
          </form>

          <!-- Divider -->
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">{{ $t('auth.signup.or') }}</span>
              </div>
            </div>
          </div>

          <!-- Social Sign Up -->
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
            </button>
            <button
              type="button"
              class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Login link -->
        <p class="text-center text-sm text-gray-600">
          {{ $t('auth.signup.have_account') }}
          <NuxtLink :to="localePath('/login')" class="font-medium text-indigo-600 hover:text-indigo-700">
            {{ $t('auth.signup.login_link') }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const localePath = useLocalePath()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const handleSubmit = () => {
  // Handle form submission
  console.log('Signup form submitted:', form.value)
}
</script>

