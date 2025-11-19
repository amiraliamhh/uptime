<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ $t('nav.brand') }}
          </NuxtLink>
          <NhLogo :mode="isDark ? 'dark' : 'light'" class="ml-2 h-8" />
          <span class="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded-full">Beta</span>
        </div>
        <div class="flex items-center space-x-4">
          <!-- Organization Selector -->
          <div v-if="user && organizations.length > 0" class="relative">
            <button
              data-org-button
              @click="showOrgDropdown = !showOrgDropdown"
              class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="max-w-[150px] truncate">{{ selectedOrganization?.name || 'Select Organization' }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown -->
            <div
              v-if="showOrgDropdown"
              data-org-dropdown
              class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Organizations</p>
              </div>
              <div class="max-h-64 overflow-y-auto">
                <button
                  v-for="org in organizations"
                  :key="org.id"
                  @click="selectOrganization(org.id)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                  :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': selectedOrganization?.id === org.id }"
                >
                  <div class="flex items-center space-x-2 flex-1 min-w-0">
                    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span class="truncate">{{ org.name }}</span>
                  </div>
                  <svg
                    v-if="selectedOrganization?.id === org.id"
                    class="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
              <!-- Add New Organization Button -->
              <div class="border-t border-gray-200 dark:border-gray-700 px-2 py-2">
                <button
                  @click="showCreateOrgModal = true; showOrgDropdown = false"
                  class="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add new organization</span>
                </button>
              </div>
            </div>
          </div>

          <DarkModeToggle />
          <div v-if="user" class="flex items-center space-x-2">
            <div v-if="user.avatar" class="w-8 h-8 rounded-full overflow-hidden">
              <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ user.name || user.email }}</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Create Organization Modal -->
    <div v-if="showCreateOrgModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeCreateOrgModal">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" @click="closeCreateOrgModal"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Create New Organization
                </h3>
                <form @submit.prevent="handleCreateOrganization" class="space-y-4">
                  <div>
                    <label for="orgName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Name *
                    </label>
                    <input
                      id="orgName"
                      v-model="createOrgForm.name"
                      type="text"
                      required
                      placeholder="Enter organization name"
                      class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label for="orgDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="orgDescription"
                      v-model="createOrgForm.description"
                      rows="3"
                      placeholder="Enter organization description (optional)"
                      class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    ></textarea>
                  </div>
                  <div v-if="createOrgError" class="text-sm text-red-600 dark:text-red-400">
                    {{ createOrgError }}
                  </div>
                  <div class="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      @click="closeCreateOrgModal"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="createOrgLoading"
                      class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ createOrgLoading ? 'Creating...' : 'Create' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
const { isDark } = useDarkMode()
const { user } = useAuth()
const { organizations, fetchOrganizations, fetchOrganization, createOrganization, currentOrganization } = useOrganizations()

const showOrgDropdown = ref(false)
const showCreateOrgModal = ref(false)
const selectedOrganization = computed(() => currentOrganization.value)

// Create organization form
const createOrgForm = ref({ name: '', description: '' })
const createOrgLoading = ref(false)
const createOrgError = ref<string | null>(null)

// Load organizations on mount
onMounted(async () => {
  if (user.value) {
    await fetchOrganizations()
    
    // Load the selected organization from localStorage or use the first one
    const savedOrgId = localStorage.getItem('selectedOrganizationId')
    if (savedOrgId) {
      const org = organizations.value.find(o => o.id === savedOrgId)
      if (org) {
        await fetchOrganization(org.id)
        return
      }
    }
    
    // If no saved organization or saved one not found, use the first one
    if (organizations.value.length > 0 && !currentOrganization.value) {
      await fetchOrganization(organizations.value[0].id)
    }
  }
})

// Watch for organizations changes
watch(organizations, async (newOrgs) => {
  if (newOrgs.length > 0 && !currentOrganization.value) {
    const savedOrgId = localStorage.getItem('selectedOrganizationId')
    const org = savedOrgId ? newOrgs.find(o => o.id === savedOrgId) : newOrgs[0]
    if (org) {
      await fetchOrganization(org.id)
    }
  }
}, { immediate: true })

// Select organization
const selectOrganization = async (orgId: string) => {
  await fetchOrganization(orgId)
  // fetchOrganization already saves to localStorage, but ensure it's saved here too
  if (typeof window !== 'undefined') {
    localStorage.setItem('selectedOrganizationId', orgId)
  }
  showOrgDropdown.value = false
  
  // Refresh the page to update all data with the new organization context
  // Alternatively, you could emit an event or use a global state
  await navigateTo(useRoute().path)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = document.querySelector('[data-org-dropdown]')
  const button = document.querySelector('[data-org-button]')
  
  if (showOrgDropdown.value && dropdown && button) {
    if (!dropdown.contains(target) && !button.contains(target)) {
      showOrgDropdown.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Create organization
const handleCreateOrganization = async () => {
  if (!createOrgForm.value.name.trim()) {
    createOrgError.value = 'Organization name is required'
    return
  }

  createOrgError.value = null
  createOrgLoading.value = true

  try {
    const result = await createOrganization({
      name: createOrgForm.value.name.trim(),
      description: createOrgForm.value.description.trim() || undefined
    })

    if (result.success && result.organization) {
      // Close modal and reset form
      closeCreateOrgModal()
      
      // Select the newly created organization
      await fetchOrganization(result.organization.id)
      
      // Refresh organizations list
      await fetchOrganizations()
      
      // Refresh the page to update all data
      await navigateTo(useRoute().path)
    } else {
      createOrgError.value = result.error || 'Failed to create organization'
    }
  } catch (err: any) {
    createOrgError.value = err.message || 'Failed to create organization'
  } finally {
    createOrgLoading.value = false
  }
}

// Close create organization modal
const closeCreateOrgModal = () => {
  showCreateOrgModal.value = false
  createOrgForm.value = { name: '', description: '' }
  createOrgError.value = null
}
</script>

