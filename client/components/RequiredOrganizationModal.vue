<template>
  <!-- This component redirects users without organizations to the creation page -->
</template>

<script lang="ts" setup>
const { user } = useAuth()
const router = useRouter()

const showModal = computed(() => {
  return user.value && user.value.hasOrganization === false
})

// Redirect to organization creation page when modal should show
watch(showModal, (isVisible) => {
  if (isVisible && router.currentRoute.value.path !== '/dashboard/organizations/new') {
    router.push('/dashboard/organizations/new')
  }
}, { immediate: true })
</script>

