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
        <!-- Header Section -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">View uptime statistics and trends for your monitors</p>
        </div>

        <!-- Date Range Selector -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center space-x-4 flex-1">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  v-model="startDate"
                  type="date"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  v-model="endDate"
                  type="date"
                  class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div class="flex items-end">
                <button
                  @click="loadReport"
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

        <!-- Error Message -->
        <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-800 dark:text-red-300">{{ error }}</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !reportData" class="flex items-center justify-center min-h-[400px]">
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-12 w-12 text-indigo-600 dark:text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500 dark:text-gray-400">Loading report data...</p>
          </div>
        </div>

        <!-- Chart Section -->
        <div v-else-if="reportData" class="space-y-6">
          <!-- Monitor Selector -->
          <div v-if="reportData.monitors && reportData.monitors.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Monitor
            </label>
            <select
              v-model="selectedMonitorId"
              @change="updateChart"
              class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Monitors (Average)</option>
              <option
                v-for="monitor in reportData.monitors"
                :key="monitor.id"
                :value="monitor.id"
              >
                {{ monitor.name }}
              </option>
            </select>
          </div>

          <!-- Uptime Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Uptime Over Time</h2>
            <div class="h-96">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>

          <!-- Summary Statistics -->
          <div v-if="selectedMonitor" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Uptime</p>
                  <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {{ selectedMonitor.overallStats.overallUptimePercentage.toFixed(2) }}%
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
                    {{ selectedMonitor.overallStats.totalChecks.toLocaleString() }}
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
                    {{ selectedMonitor.overallStats.averageResponseTime.toFixed(0) }}ms
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
                    {{ (selectedMonitor.overallStats.failedChecks + selectedMonitor.overallStats.timeoutChecks + selectedMonitor.overallStats.errorChecks).toLocaleString() }}
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
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No data available</h3>
          <p class="text-gray-500 dark:text-gray-400">No report data found for the selected date range.</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'auth'
})

const { logout } = useAuth()
const { currentOrganization, organizations, fetchOrganizations, fetchOrganization } = useOrganizations()
const { reportData, fetchReport, loading, error } = useReports()
const localePath = useLocalePath()

// Date range state
const startDate = ref('')
const endDate = ref('')
const selectedMonitorId = ref('all')
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

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
  loadReport()
}

// Selected monitor computed
const selectedMonitor = computed(() => {
  if (!reportData.value || !reportData.value.monitors) return null
  
  if (selectedMonitorId.value === 'all') {
    // Calculate average across all monitors
    const allSummaries: any[] = []
    const dateMap = new Map<string, { total: number; sum: number; count: number }>()
    
    reportData.value.monitors.forEach((monitor: any) => {
      monitor.dailySummaries.forEach((summary: any) => {
        if (!dateMap.has(summary.date)) {
          dateMap.set(summary.date, { total: 0, sum: 0, count: 0 })
        }
        const entry = dateMap.get(summary.date)!
        entry.sum += summary.uptimePercentage
        entry.count += 1
      })
    })
    
    const avgSummaries = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        uptimePercentage: data.count > 0 ? data.sum / data.count : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    const totalChecks = reportData.value.monitors.reduce((sum: number, m: any) => sum + m.overallStats.totalChecks, 0)
    const successfulChecks = reportData.value.monitors.reduce((sum: number, m: any) => sum + m.overallStats.successfulChecks, 0)
    const failedChecks = reportData.value.monitors.reduce((sum: number, m: any) => sum + m.overallStats.failedChecks, 0)
    const timeoutChecks = reportData.value.monitors.reduce((sum: number, m: any) => sum + m.overallStats.timeoutChecks, 0)
    const errorChecks = reportData.value.monitors.reduce((sum: number, m: any) => sum + m.overallStats.errorChecks, 0)
    const avgResponseTime = reportData.value.monitors.reduce((sum: number, m: any) => sum + m.overallStats.averageResponseTime, 0) / reportData.value.monitors.length
    
    return {
      name: 'All Monitors (Average)',
      dailySummaries: avgSummaries,
      overallStats: {
        totalChecks,
        successfulChecks,
        failedChecks,
        timeoutChecks,
        errorChecks,
        overallUptimePercentage: totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0,
        averageResponseTime: avgResponseTime
      }
    }
  }
  
  return reportData.value.monitors.find((m: any) => m.id === selectedMonitorId.value) || null
})

// Load report
const loadReport = async () => {
  if (!startDate.value || !endDate.value) return

  try {
    await fetchReport(startDate.value, endDate.value)
    await nextTick()
    updateChart()
  } catch (err) {
    console.error('Failed to load report:', err)
  }
}

// Update chart
const updateChart = async () => {
  if (!chartCanvas.value || !selectedMonitor.value) return

  // Load Chart.js dynamically
  const Chart = (await import('chart.js/auto')).default

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const summaries = selectedMonitor.value.dailySummaries || []
  const labels = summaries.map((s: any) => {
    const date = new Date(s.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  const uptimeData = summaries.map((s: any) => s.uptimePercentage)

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#e5e7eb' : '#374151'
  const gridColor = isDark ? '#374151' : '#e5e7eb'

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Uptime %',
        data: uptimeData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: textColor
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context: any) => {
              return `Uptime: ${context.parsed.y.toFixed(2)}%`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 0,
          max: 100,
          ticks: {
            color: textColor,
            callback: (value: any) => `${value}%`
          },
          grid: {
            color: gridColor
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: gridColor
          }
        }
      }
    }
  })
}

// Watch for dark mode changes
const { isDark } = useDarkMode()
watch(isDark, () => {
  if (chartInstance) {
    updateChart()
  }
})

// Initialize
onMounted(async () => {
  initializeDates()
  
  // Ensure organization is loaded
  if (!currentOrganization.value) {
    try {
      await fetchOrganizations()
      if (organizations.value.length > 0) {
        const savedOrgId = localStorage.getItem('selectedOrganizationId')
        const org = savedOrgId ? organizations.value.find(o => o.id === savedOrgId) : organizations.value[0]
        if (org) {
          await fetchOrganization(org.id)
        }
      }
    } catch (err) {
      console.error('Failed to load organizations:', err)
    }
  }
  
  await loadReport()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

const handleLogout = () => {
  logout()
  navigateTo(localePath('/login'))
}
</script>

