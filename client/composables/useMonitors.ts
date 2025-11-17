import { ref } from 'vue'

interface Monitor {
  id: string
  organizationId: string
  type: 'https' | 'tcp'
  name: string
  failThreshold: number
  checkInterval: number
  checkTimeout: number
  url: string
  httpMethod: string
  requestHeaders: Array<{ key: string; value: string }>
  followRedirects: boolean
  expectedStatusCodes: string[]
  expectedResponseHeaders: Array<{ key: string; value: string }>
  contacts: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CreateMonitorPayload {
  type: 'https' | 'tcp'
  name: string
  url: string
  httpMethod?: string
  requestHeaders?: Array<{ key: string; value: string }>
  followRedirects?: boolean
  expectedStatusCodes?: string[]
  expectedResponseHeaders?: Array<{ key: string; value: string }>
  checkInterval?: number
  checkTimeout?: number
  failThreshold?: number
  contacts?: string[]
}

interface UpdateMonitorPayload {
  name?: string
  isActive?: boolean
  checkInterval?: number
  checkTimeout?: number
  failThreshold?: number
}

interface Log {
  id: string
  monitorId: string
  organizationId: string
  status: 'success' | 'failure' | 'timeout' | 'error'
  responseTime: number
  sslHandshakeTime?: number
  dnsLookupTime?: number
  tcpConnectTime?: number
  httpStatus?: number
  httpVersion?: string
  responseSize?: number
  redirectCount: number
  errorMessage?: string
  errorCode?: string
  requestUrl: string
  requestMethod: string
  requestHeaders?: Record<string, string>
  responseHeaders?: Record<string, string>
  responseBody?: string
  responseBodyTruncated: boolean
  userAgent?: string
  ipAddress?: string
  checkedAt: string
  createdAt: string
}

export function useMonitors() {
  const config = useRuntimeConfig()
  const monitors = ref<Monitor[]>([])
  const currentMonitor = ref<Monitor | null>(null)
  const logs = ref<Log[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { currentOrganization } = useOrganizations()

  // Get auth token from cookie
  const getAuthToken = () => {
    const tokenCookie = useCookie('auth_token')
    return tokenCookie.value
  }

  // Get organization ID from current organization
  const getOrganizationId = () => {
    if (!currentOrganization.value?.id) {
      throw new Error('No organization selected. Please select an organization first.')
    }
    return currentOrganization.value.id
  }

  // Fetch all monitors
  const fetchMonitors = async (organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      const response = await fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch monitors')
      }

      const data = await response.json()
      monitors.value = data.monitors || []
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch single monitor
  const fetchMonitor = async (id: string, organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      const response = await fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch monitor')
      }

      const data = await response.json()
      currentMonitor.value = data.monitor
      return data.monitor
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create monitor
  const createMonitor = async (payload: CreateMonitorPayload, organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      const response = await fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create monitor')
      }

      const data = await response.json()
      return data.monitor
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update monitor
  const updateMonitor = async (id: string, payload: UpdateMonitorPayload, organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      const response = await fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update monitor')
      }

      const data = await response.json()
      return data.monitor
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete monitor
  const deleteMonitor = async (id: string, organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      const response = await fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete monitor')
      }

      // Remove from local state
      monitors.value = monitors.value.filter(m => m.id !== id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch monitor logs
  const fetchMonitorLogs = async (id: string, limit: number = 50, offset: number = 0, organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      const response = await fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors/${id}/logs?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch monitor logs')
      }

      const data = await response.json()
      logs.value = data.logs || []
      return {
        logs: data.logs || [],
        total: data.total || 0
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch monitor summaries
  const fetchMonitorSummaries = async (id: string, startDate?: string, endDate?: string, organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      let url = `${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors/${id}/summaries`
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch monitor summaries')
      }

      const data = await response.json()
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch monitor uptime statistics
  const fetchMonitorUptime = async (id: string, startDate?: string, endDate?: string, organizationId?: string) => {
    loading.value = true
    error.value = null

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const orgId = organizationId || getOrganizationId()

      let url = `${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/monitors/${id}/uptime`
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch monitor uptime')
      }

      const data = await response.json()
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    monitors,
    currentMonitor,
    logs,
    loading,
    error,
    fetchMonitors,
    fetchMonitor,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    fetchMonitorLogs,
    fetchMonitorSummaries,
    fetchMonitorUptime
  }
}

