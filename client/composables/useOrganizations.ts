export const useOrganizations = () => {
  const config = useRuntimeConfig()
  const { token } = useAuth()
  const organizations = useState('organizations', () => [] as any[])
  const currentOrganization = useState('currentOrganization', () => null as any)
  const loading = useState('organizationsLoading', () => false)
  const error = useState('organizationsError', () => null as string | null)

  const fetchOrganizations = async () => {
    if (!token.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/organizations`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      organizations.value = response.organizations || []
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to fetch organizations'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchOrganization = async (id: string) => {
    if (!token.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${id}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      currentOrganization.value = response.organization
      // Save to localStorage whenever organization is fetched
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedOrganizationId', id)
      }
      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to fetch organization'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Helper function to get organization ID with localStorage fallback
  const getOrganizationId = (): string | null => {
    // First try currentOrganization
    if (currentOrganization.value?.id) {
      return currentOrganization.value.id
    }
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('selectedOrganizationId')
      if (savedId) {
        return savedId
      }
    }
    
    return null
  }

  const updateOrganization = async (id: string, data: { name?: string; description?: string }) => {
    if (!token.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: data
      })

      // Update current organization if it's the one being updated
      if (currentOrganization.value?.id === id) {
        currentOrganization.value = response.organization
      }

      // Update in organizations list
      const index = organizations.value.findIndex(org => org.id === id)
      if (index !== -1) {
        organizations.value[index] = response.organization
      }

      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to update organization'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchMembers = async (organizationId: string) => {
    if (!token.value) return

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${organizationId}/members`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return { success: true, data: response, members: response.members || [] }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to fetch members'
      return { success: false, error: error.value, members: [] }
    } finally {
      loading.value = false
    }
  }

  const addMember = async (organizationId: string, userId: string, role: 'admin' | 'member') => {
    if (!token.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: { userId, role }
      })

      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to add member'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const removeMember = async (organizationId: string, memberId: string) => {
    if (!token.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/organizations/${organizationId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      return { success: true, data: response }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to remove member'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const createOrganization = async (data: { name: string; description?: string }) => {
    if (!token.value) return { success: false, error: 'Not authenticated' }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/api/v1/organizations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: data
      })

      // Add to organizations list
      if (response.organization) {
        organizations.value.push(response.organization)
      }

      return { success: true, data: response, organization: response.organization }
    } catch (err: any) {
      error.value = err.data?.error || err.message || 'Failed to create organization'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    organizations: readonly(organizations),
    currentOrganization: readonly(currentOrganization),
    loading: readonly(loading),
    error: readonly(error),
    fetchOrganizations,
    fetchOrganization,
    updateOrganization,
    fetchMembers,
    addMember,
    removeMember,
    createOrganization,
    getOrganizationId
  }
}

