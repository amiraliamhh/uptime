<template>
  <div>
    <NuxtPage />
    <RequiredOrganizationModal />
  </div>
</template>

<script lang="ts" setup>
const { initDarkMode } = useDarkMode()
const { isAuthenticated, fetchProfile } = useAuth()

onMounted(async () => {
  initDarkMode()
  
  // Fetch user profile if authenticated to check hasOrganization
  if (isAuthenticated.value) {
    await fetchProfile()
  }
})
</script>

