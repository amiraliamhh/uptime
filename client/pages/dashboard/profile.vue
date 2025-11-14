<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <AuthenticatedHeader />

    <div class="flex">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-[73px] w-64 h-[calc(100vh-73px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40">
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <!-- Monitors -->
          <NuxtLink
            to="/dashboard"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': $route.path === '/dashboard' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="font-medium">Monitors</span>
          </NuxtLink>

          <!-- Status Pages -->
          <NuxtLink
            to="/dashboard/status-pages"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': $route.path.startsWith('/dashboard/status-pages') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Status Pages</span>
          </NuxtLink>

          <!-- Reports -->
          <NuxtLink
            to="/dashboard/reports"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': $route.path.startsWith('/dashboard/reports') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Reports</span>
          </NuxtLink>

          <!-- Settings -->
          <NuxtLink
            to="/dashboard/settings"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': $route.path.startsWith('/dashboard/settings') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Settings</span>
          </NuxtLink>
        </nav>

        <!-- Profile and Logout at bottom -->
        <div class="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <NuxtLink
            to="/dashboard/profile"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': $route.path === '/dashboard/profile' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium">Profile</span>
          </NuxtLink>
          <button
            @click="handleLogout"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 ml-64 mt-[73px] px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header Section -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your account information and password</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-800 dark:text-red-300">{{ errorMessage }}</p>
          </div>
        </div>


        <!-- Profile Information Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          
          <div class="space-y-4" v-if="user">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                {{ user.email }}
              </div>
            </div>

            <!-- Date of Join -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Join
              </label>
              <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                {{ formatDate(user.createdAt) }}
              </div>
            </div>

            <!-- Provider -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sign-in Method
              </label>
              <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100">
                {{ user.provider === 'google' ? 'Google' : 'Email/Password' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Password Management Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Password</h2>
          
          <form @submit.prevent="handlePasswordChange" class="space-y-4">
            <!-- Current Password (only if user has a password) -->
            <div v-if="user?.provider === 'local'">
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password *
              </label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                required
                placeholder="Enter your current password"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {{ user?.provider === 'local' ? 'New Password' : 'Set Password' }} *
              </label>
              <input
                id="newPassword"
                v-model="passwordForm.password"
                type="password"
                required
                minlength="6"
                :placeholder="user?.provider === 'local' ? 'Enter your new password' : 'Enter a password (minimum 6 characters)'"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Minimum 6 characters</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="6"
                placeholder="Confirm your password"
                class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <!-- Submit Button -->
            <div class="flex items-center justify-end pt-4">
              <button
                type="submit"
                :disabled="passwordLoading"
                class="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <svg v-if="passwordLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ passwordLoading ? 'Updating...' : (user?.provider === 'local' ? 'Change Password' : 'Set Password') }}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeSuccessModal">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" @click="closeSuccessModal"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Password Updated Successfully
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Your password has been {{ user?.provider === 'local' ? 'changed' : 'set' }} successfully.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="closeSuccessModal"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-base font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'auth'
})

const { user, fetchProfile, changePassword, isAuthenticated, logout } = useAuth()
const localePath = useLocalePath()

// Password form
const passwordForm = ref({
  currentPassword: '',
  password: '',
  confirmPassword: ''
})

// Loading and error states
const passwordLoading = ref(false)
const errorMessage = ref<string | null>(null)
const showSuccessModal = ref(false)

// Format date helper
const formatDate = (date: string | Date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Handle password change
const handlePasswordChange = async () => {
  errorMessage.value = null
  successMessage.value = null

  // Validate passwords match
  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  // Validate password length
  if (passwordForm.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }

  passwordLoading.value = true

  try {
    const payload: { currentPassword?: string; password: string } = {
      password: passwordForm.value.password
    }

    // Only include currentPassword if user has a password (local provider)
    if (user.value?.provider === 'local') {
      payload.currentPassword = passwordForm.value.currentPassword
    }

    const result = await changePassword(payload)

    if (result.success) {
      // Reset form
      passwordForm.value = {
        currentPassword: '',
        password: '',
        confirmPassword: ''
      }
      // Show success modal
      showSuccessModal.value = true
    } else {
      errorMessage.value = result.error || 'Failed to update password'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update password'
  } finally {
    passwordLoading.value = false
  }
}

// Fetch profile on mount
onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    await fetchProfile()
  } else if (isAuthenticated.value && user.value) {
    // Refresh profile to get latest data
    await fetchProfile()
  }
})

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const handleLogout = () => {
  logout()
  navigateTo(localePath('/login'))
}
</script>

