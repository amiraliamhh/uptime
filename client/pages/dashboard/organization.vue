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

          <!-- Organization -->
          <NuxtLink
            to="/dashboard/organization"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': $route.path.startsWith('/dashboard/organization') }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="font-medium">Organization</span>
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
        <!-- Loading State -->
        <div v-if="loading && !organization" class="flex items-center justify-center min-h-[400px]">
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Loading organization...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error && !organization" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Error loading organization</h3>
              <p class="text-sm text-red-700 dark:text-red-400 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Organization Content -->
        <div v-else-if="organization">
          <!-- Header Section -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Organization</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">Manage your organization settings and members</p>
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

          <!-- Success Message -->
          <div v-if="successMessage" class="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-green-400 dark:text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-green-800 dark:text-green-300">{{ successMessage }}</p>
            </div>
          </div>

          <!-- Organization Settings Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Organization Settings</h2>
            
            <form @submit.prevent="handleUpdateOrganization" class="space-y-4">
              <!-- Organization Name -->
              <div>
                <label for="organizationName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name *
                </label>
                <input
                  id="organizationName"
                  v-model="organizationForm.name"
                  type="text"
                  required
                  placeholder="Enter organization name"
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <!-- Submit Button -->
              <div class="flex items-center justify-end pt-4">
                <button
                  type="submit"
                  :disabled="updateLoading"
                  class="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  <svg v-if="updateLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ updateLoading ? 'Updating...' : 'Update Organization' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Members Management Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Members</h2>
              <button
                v-if="isAdmin"
                @click="showAddMemberModal = true"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Member
              </button>
            </div>

            <!-- Loading Members -->
            <div v-if="membersLoading" class="p-12 text-center">
              <svg class="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500 dark:text-gray-400">Loading members...</p>
            </div>

            <!-- Members Table -->
            <div v-else-if="members.length > 0" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th v-if="isAdmin" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ member.user?.name || 'N/A' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ member.user?.email || 'N/A' }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        member.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' : 
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      ]">
                        {{ member.role === 'admin' ? 'Admin' : 'Member' }}
                      </span>
                    </td>
                    <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        v-if="member.userId !== user?.id"
                        @click="handleRemoveMember(member.userId)"
                        class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Remove member"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Empty State -->
            <div v-else class="p-12 text-center">
              <svg class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No members yet</h3>
              <p class="text-gray-500 dark:text-gray-400">Get started by adding your first member</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Add Member Modal -->
    <div v-if="showAddMemberModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeAddMemberModal">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" @click="closeAddMemberModal"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                  Add Member
                </h3>
                <form @submit.prevent="handleAddMember" class="space-y-4">
                  <div>
                    <label for="memberUserId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User ID *
                    </label>
                    <input
                      id="memberUserId"
                      v-model="addMemberForm.userId"
                      type="text"
                      required
                      placeholder="Enter user ID"
                      class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter the user ID of the person you want to add</p>
                  </div>
                  <div>
                    <label for="memberRole" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      id="memberRole"
                      v-model="addMemberForm.role"
                      required
                      class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div v-if="addMemberError" class="text-sm text-red-600 dark:text-red-400">
                    {{ addMemberError }}
                  </div>
                  <div class="flex items-center justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      @click="closeAddMemberModal"
                      class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      :disabled="addMemberLoading"
                      class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                    >
                      <svg v-if="addMemberLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ addMemberLoading ? 'Adding...' : 'Add Member' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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

const { user, logout } = useAuth()
const { 
  currentOrganization, 
  fetchOrganizations, 
  fetchOrganization, 
  updateOrganization,
  fetchMembers,
  addMember,
  removeMember,
  loading,
  error
} = useOrganizations()
const localePath = useLocalePath()

// Organization state
const organization = computed(() => currentOrganization.value)
const organizationForm = ref({ name: '' })
const updateLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Members state
const members = ref<any[]>([])
const membersLoading = ref(false)
const showAddMemberModal = ref(false)
const addMemberForm = ref({ userId: '', role: 'member' as 'admin' | 'member' })
const addMemberLoading = ref(false)
const addMemberError = ref<string | null>(null)

// Check if user is admin
const isAdmin = computed(() => {
  if (!organization.value || !user.value) return false
  const membership = organization.value.members?.find((m: any) => m.userId === user.value?.id)
  return membership?.role === 'admin'
})

// Load organization and members
const loadOrganization = async () => {
  try {
    // First, get all organizations
    const orgsResult = await fetchOrganizations()
    if (!orgsResult.success || !orgsResult.data?.organizations || orgsResult.data.organizations.length === 0) {
      errorMessage.value = 'No organizations found. Please create an organization first.'
      return
    }

    // Try to load from currentOrganization, then localStorage, then use first organization
    let orgToLoad = null
    if (currentOrganization.value?.id) {
      orgToLoad = orgsResult.data.organizations.find((o: any) => o.id === currentOrganization.value.id)
    }
    
    if (!orgToLoad && typeof window !== 'undefined') {
      const savedOrgId = localStorage.getItem('selectedOrganizationId')
      if (savedOrgId) {
        orgToLoad = orgsResult.data.organizations.find((o: any) => o.id === savedOrgId)
      }
    }
    
    if (!orgToLoad) {
      orgToLoad = orgsResult.data.organizations[0]
    }
    
    await fetchOrganization(orgToLoad.id)
    
    // Load members
    await loadMembers()
  } catch (err) {
    console.error('Failed to load organization:', err)
  }
}

// Load members
const loadMembers = async () => {
  if (!organization.value) return
  
  membersLoading.value = true
  try {
    const result = await fetchMembers(organization.value.id)
    if (result.success && result.members) {
      members.value = result.members
    }
  } catch (err) {
    console.error('Failed to load members:', err)
  } finally {
    membersLoading.value = false
  }
}

// Update organization
const handleUpdateOrganization = async () => {
  if (!organization.value || !isAdmin.value) return

  errorMessage.value = null
  successMessage.value = null
  updateLoading.value = true

  try {
    const result = await updateOrganization(organization.value.id, {
      name: organizationForm.value.name
    })

    if (result.success) {
      successMessage.value = 'Organization updated successfully'
      // Reload organization to get updated data
      await fetchOrganization(organization.value.id)
    } else {
      errorMessage.value = result.error || 'Failed to update organization'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update organization'
  } finally {
    updateLoading.value = false
  }
}

// Add member
const handleAddMember = async () => {
  if (!organization.value || !isAdmin.value) return

  addMemberError.value = null
  addMemberLoading.value = true

  try {
    if (!addMemberForm.value.userId) {
      addMemberError.value = 'User ID is required'
      addMemberLoading.value = false
      return
    }

    const result = await addMember(
      organization.value.id,
      addMemberForm.value.userId,
      addMemberForm.value.role
    )

    if (result.success) {
      closeAddMemberModal()
      await loadMembers()
      successMessage.value = 'Member added successfully'
    } else {
      addMemberError.value = result.error || 'Failed to add member'
    }
  } catch (err: any) {
    addMemberError.value = err.message || 'Failed to add member'
  } finally {
    addMemberLoading.value = false
  }
}

// Remove member
const handleRemoveMember = async (memberId: string) => {
  if (!organization.value || !isAdmin.value) return
  if (!confirm('Are you sure you want to remove this member?')) return

  try {
    const result = await removeMember(organization.value.id, memberId)
    if (result.success) {
      await loadMembers()
      successMessage.value = 'Member removed successfully'
    } else {
      errorMessage.value = result.error || 'Failed to remove member'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to remove member'
  }
}

// Close add member modal
const closeAddMemberModal = () => {
  showAddMemberModal.value = false
  addMemberForm.value = { userId: '', role: 'member' }
  addMemberError.value = null
}

// Initialize form when organization loads
watch(organization, (org) => {
  if (org) {
    organizationForm.value.name = org.name || ''
  }
}, { immediate: true })

// Initialize
onMounted(async () => {
  await loadOrganization()
})

const handleLogout = () => {
  logout()
  navigateTo(localePath('/login'))
}
</script>

