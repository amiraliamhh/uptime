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
        <div v-if="loading && !monitor" class="flex items-center justify-center min-h-[400px]">
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Loading monitor details...</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Error loading monitor</h3>
              <p class="text-sm text-red-700 dark:text-red-400 mt-1">{{ error }}</p>
            </div>
          </div>
        </div>

        <!-- Monitor Details -->
        <div v-else-if="monitor">
          <!-- Header Section -->
          <div class="mb-6">
            <div class="flex items-center justify-between">
              <div>
                <NuxtLink :to="localePath('/dashboard')" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-2">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Monitors
                </NuxtLink>
                <div class="flex items-center space-x-3">
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ monitor.name }}</h1>
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    monitor.isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  ]">
                    {{ monitor.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mt-1">{{ monitor.url }} • {{ monitor.type.toUpperCase() }}</p>
              </div>
              <div class="flex items-center space-x-3">
                <NuxtLink :to="localePath(`/dashboard/monitors/${monitor.id}/edit`)" class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Date Range Selector -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-8 b-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex items-center space-x-4 flex-1">
                <div class="mt-[-20px]">
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    v-model="startDate"
                    type="date"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div class="mt-[-20px]">
                  <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    v-model="endDate"
                    type="date"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div class="flex items-end">
                  <button
                    @click="loadData"
                    :disabled="loading"
                    class="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ loading ? 'Loading...' : 'Apply' }}
                  </button>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  v-for="preset in datePresets"
                  :key="preset.label"
                  @click="applyDatePreset(preset)"
                  class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Overall Uptime Statistics -->
          <div v-if="uptimeData" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-6">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Uptime</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {{ uptimeData.uptime.overallUptimePercentage.toFixed(2) }}%
                  </p>
                </div>
                <div class="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Checks</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {{ uptimeData.uptime.totalChecks.toLocaleString() }}
                  </p>
                </div>
                <div class="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {{ uptimeData.uptime.averageResponseTime.toFixed(0) }}ms
                  </p>
                </div>
                <div class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Failed Checks</p>
                  <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                    {{ (uptimeData.uptime.failedChecks + uptimeData.uptime.timeoutChecks + uptimeData.uptime.errorChecks).toLocaleString() }}
                  </p>
                </div>
                <div class="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Daily Summaries Table -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Daily Summaries</h2>
            </div>
            <div v-if="loading" class="p-12 text-center">
              <svg class="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-500 dark:text-gray-400">Loading summaries...</p>
            </div>
            <div v-else-if="summaries.length === 0" class="p-12 text-center">
              <svg class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No data available</h3>
              <p class="text-gray-500 dark:text-gray-400">No summaries found for the selected date range.</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uptime
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Checks
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Successful
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Failed
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Response
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="summary in summaries" :key="summary.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ formatDate(summary.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="[
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        summary.uptimePercentage >= 99 ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                        summary.uptimePercentage >= 95 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                        'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                      ]">
                        {{ summary.uptimePercentage.toFixed(2) }}%
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ summary.totalChecks.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {{ summary.successfulChecks.toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {{ (summary.failedChecks + summary.timeoutChecks + summary.errorChecks).toLocaleString() }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {{ summary.averageResponseTime.toFixed(0) }}ms
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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

const route = useRoute()
const localePath = useLocalePath()
const { logout } = useAuth()
const { fetchMonitor, fetchMonitorSummaries, fetchMonitorUptime, currentMonitor, loading, error } = useMonitors()

const monitor = computed(() => currentMonitor.value)
const monitorId = computed(() => route.params.id as string)

// Date range state
const startDate = ref('')
const endDate = ref('')
const summaries = ref<any[]>([])
const uptimeData = ref<any>(null)

// Date presets
const datePresets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 }
]

// Initialize dates (default to last 30 days)
const initializeDates = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  
  endDate.value = end.toISOString().split('T')[0]
  startDate.value = start.toISOString().split('T')[0]
}

// Apply date preset
const applyDatePreset = (preset: { days: number }) => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - preset.days)
  
  endDate.value = end.toISOString().split('T')[0]
  startDate.value = start.toISOString().split('T')[0]
  loadData()
}

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Load monitor data
const loadMonitor = async () => {
  try {
    await fetchMonitor(monitorId.value)
  } catch (err) {
    console.error('Failed to load monitor:', err)
  }
}

// Load summaries and uptime data
const loadData = async () => {
  if (!startDate.value || !endDate.value) return

  try {
    const [summariesResult, uptimeResult] = await Promise.all([
      fetchMonitorSummaries(monitorId.value, startDate.value, endDate.value),
      fetchMonitorUptime(monitorId.value, startDate.value, endDate.value)
    ])

    summaries.value = summariesResult.summaries || []
    uptimeData.value = uptimeResult
  } catch (err) {
    console.error('Failed to load data:', err)
  }
}

// Initialize
onMounted(async () => {
  initializeDates()
  await loadMonitor()
  await loadData()
})

const handleLogout = () => {
  logout()
  navigateTo(localePath('/login'))
}
</script>

