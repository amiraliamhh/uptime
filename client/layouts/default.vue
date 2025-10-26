<template>
  <div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
const { isDark } = useDarkMode()

useHead({
  bodyAttrs: {
    class: isDark ? 'dark' : 'light'
  }
})
</script>