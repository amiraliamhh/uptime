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
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Monitors</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage your services uptime</p>
        </div>

        <!-- Actions Bar -->
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <NuxtLink :to="localePath('/dashboard/monitors/new')" class="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Monitor
          </NuxtLink>
          
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              v-model="searchQuery"
              placeholder="Search monitors..."
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Monitors Table -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    URL
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uptime
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <!-- Loading State -->
                <tr v-if="monitorsLoading">
                  <td colspan="6" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center">
                      <svg class="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p class="text-gray-500 dark:text-gray-400">Loading monitors...</p>
                    </div>
                  </td>
                </tr>

                <!-- Empty State -->
                <tr v-else-if="filteredMonitors.length === 0 && !searchQuery">
                  <td colspan="6" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center">
                      <div class="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No monitors yet</h3>
                      <p class="text-gray-500 dark:text-gray-400 mb-4">Get started by adding your first monitor</p>
                      <NuxtLink :to="localePath('/dashboard/monitors/new')" class="inline-flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Monitor
                      </NuxtLink>
                    </div>
                  </td>
                </tr>

                <!-- No Search Results -->
                <tr v-else-if="filteredMonitors.length === 0 && searchQuery">
                  <td colspan="6" class="px-6 py-12 text-center">
                    <div class="flex flex-col items-center">
                      <svg class="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                      <p class="text-gray-500 dark:text-gray-400">Try adjusting your search query</p>
                    </div>
                  </td>
                </tr>

                <!-- Monitor Data -->
                <tr v-else v-for="monitor in filteredMonitors" :key="monitor.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getMonitorStatus(monitor) === 'up' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 
                      'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                    ]">
                      <svg class="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      {{ getMonitorStatus(monitor) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ monitor.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ monitor.type.toUpperCase() }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{{ monitor.url }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white font-medium">{{ getUptimePercentage(monitor) }}%</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900 dark:text-white">{{ getAverageResponseTime(monitor) }}ms</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center space-x-3">
                      <NuxtLink :to="localePath(`/dashboard/monitors/${monitor.id}`)" class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300" title="View details">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </NuxtLink>
                      <NuxtLink :to="localePath(`/dashboard/monitors/${monitor.id}/edit`)" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </NuxtLink>
                      <button @click="handleDelete(monitor.id)" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300" title="Delete">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'auth'
})

const { user, isAuthenticated, fetchProfile, logout } = useAuth()
const { monitors, fetchMonitors, deleteMonitor, loading: monitorsLoading, error: monitorsError } = useMonitors()
const localePath = useLocalePath()

// Search query
const searchQuery = ref('')

// Computed filtered monitors
const filteredMonitors = computed(() => {
  if (!searchQuery.value) return monitors.value
  
  const query = searchQuery.value.toLowerCase()
  return monitors.value.filter(monitor => 
    monitor.name.toLowerCase().includes(query) || 
    monitor.url.toLowerCase().includes(query)
  )
})

// Calculate uptime percentage (mock for now, will be calculated from logs)
const getUptimePercentage = (monitor: any) => {
  // TODO: Calculate from actual logs
  return 99.9
}

// Calculate average response time (mock for now, will be calculated from logs)
const getAverageResponseTime = (monitor: any) => {
  // TODO: Calculate from actual logs
  return 150
}

// Get monitor status (mock for now, will be based on last check)
const getMonitorStatus = (monitor: any) => {
  // TODO: Get from last log entry
  return monitor.isActive ? 'up' : 'down'
}

// Delete handler
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this monitor?')) return
  
  try {
    await deleteMonitor(id)
    // Refresh the list
    await fetchMonitors()
  } catch (err: any) {
    alert(`Failed to delete monitor: ${err.message}`)
  }
}

// Fetch user profile and monitors on mount
onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    await fetchProfile()
  }
  
  // Fetch monitors
  try {
    await fetchMonitors()
  } catch (err) {
    console.error('Failed to fetch monitors:', err)
  }
})

const handleLogout = () => {
  logout()
  navigateTo(localePath('/login'))
}
</script>

