<template>
  <NuxtPage />
</template>

<script lang="ts" setup>
const { initDarkMode } = useDarkMode()

onMounted(() => {
  initDarkMode()
})
</script>

