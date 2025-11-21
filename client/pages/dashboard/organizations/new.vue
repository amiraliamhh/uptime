<template>
  <div class="min-h-screen w-screen bg-gray-50 dark:bg-gray-900">

    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <!-- Page Title -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Organization
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Create a new organization to manage your monitors and team members.
          </p>
        </div>

        <!-- Warning Banner -->
        <div v-if="limits" class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div class="ml-3 flex-1">
              <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Organization Limit
              </h3>
              <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  You can create a maximum of <strong>{{ limits.maxOrganizationsPerUser }}</strong> organizations.
                  <span v-if="organizationsCreated > 0">
                    You currently have <strong>{{ organizationsCreated }}</strong> organization{{ organizationsCreated !== 1 ? 's' : '' }}.
                  </span>
                  <span v-else>
                    This will be your first organization.
                  </span>
                </p>
                <p v-if="limits.organizationsRemaining === 0" class="mt-1 font-semibold">
                  You have reached your organization limit and cannot create more organizations.
                </p>
                <p v-else class="mt-1">
                  You can create <strong>{{ limits.organizationsRemaining }}</strong> more organization{{ limits.organizationsRemaining !== 1 ? 's' : '' }}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Organization Form -->
        <form @submit.prevent="handleCreateOrganization" class="space-y-6">
          <div>
            <label for="orgName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Name <span class="text-red-500">*</span>
            </label>
            <input
              id="orgName"
              v-model="orgName"
              type="text"
              required
              :disabled="loading || (limits && limits.organizationsRemaining === 0)"
              placeholder="Enter your organization name"
              class="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              autofocus
            />
          </div>

          <div>
            <label for="orgDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span class="text-gray-400 dark:text-gray-500 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              id="orgDescription"
              v-model="orgDescription"
              rows="4"
              :disabled="loading || (limits && limits.organizationsRemaining === 0)"
              placeholder="Enter organization description (optional)"
              class="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            ></textarea>
          </div>

          <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <div class="flex items-center justify-end space-x-4 pt-4">
            <NuxtLink
              to="/dashboard"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading || !orgName.trim() || (limits && limits.organizationsRemaining === 0)"
              class="px-6 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
              <span v-else>Create Organization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { user, limits, fetchProfile } = useAuth()
const { createOrganization, fetchOrganizations, fetchOrganization } = useOrganizations()
const router = useRouter()

const orgName = ref('')
const orgDescription = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

// Calculate how many organizations the user has created
const organizationsCreated = computed(() => {
  if (!limits.value) return 0
  return limits.value.maxOrganizationsPerUser - limits.value.organizationsRemaining
})

// Fetch profile to get latest limits
onMounted(async () => {
  if (user.value) {
    await fetchProfile()
  }
})

const handleCreateOrganization = async () => {
  if (!orgName.value.trim()) return

  // Check if user has reached the limit
  if (limits.value && limits.value.organizationsRemaining === 0) {
    error.value = `You have reached the maximum limit of ${limits.value.maxOrganizationsPerUser} organizations per user`
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await createOrganization({
      name: orgName.value.trim(),
      description: orgDescription.value.trim() || undefined
    })

    if (result.success) {
      // Refresh organizations list
      await fetchOrganizations()
      
      // Select the newly created organization
      if (result.organization?.id) {
        await fetchOrganization(result.organization.id)
      }
      
      // Refresh user profile to update hasOrganization and limits
      await fetchProfile()
      
      // Redirect to dashboard
      await router.push('/dashboard')
    } else {
      error.value = result.error || 'Failed to create organization'
    }
  } catch (err: any) {
    error.value = err.data?.error || err.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}
</script>

