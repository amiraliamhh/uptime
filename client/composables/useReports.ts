export const useReports = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()
  const { currentOrganization } = useOrganizations()
  const reportData = useState('reportData', () => null as any)
  const loading = useState('reportsLoading', () => false)
  const error = useState('reportsError', () => null as string | null)

  const fetchReport = async (startDate?: string, endDate?: string, organizationId?: string) => {
    if (!token.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    error.value = null

    try {
      // Try provided organizationId, then currentOrganization, then localStorage
      let orgId = organizationId
      if (!orgId) {
        orgId = currentOrganization.value?.id
      }
      if (!orgId && typeof window !== 'undefined') {
        orgId = localStorage.getItem('selectedOrganizationId')
      }
      
      if (!orgId) {
        throw new Error('No organization selected')
      }

      let url = `${config.public.apiBaseUrl}/api/v1/organizations/${orgId}/reports`
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await $fetch(url, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      reportData.value = response
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to fetch report'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    reportData: readonly(reportData),
    loading: readonly(loading),
    error: readonly(error),
    fetchReport
  }
}

