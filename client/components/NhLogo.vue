<template>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100">
    <rect
      x="25"
      y="22"
      width="64"
      height="64"
      rx="12"
      :fill="mode === 'dark' ? 'white' : 'black'"
    />
    <text x="58" y="72" font-family="Arial, sans-serif" font-size="50" font-weight="bold" :fill="mode === 'dark' ? 'black' : 'white'" text-anchor="middle">9</text>
    <text x="96" y="70" font-family="Arial, sans-serif" font-size="48" font-weight="bold" :fill="mode === 'dark' ? 'white' : 'black'">headache</text>
  </svg>
</template>

<script lang="ts" setup>
const props = defineProps<{
  mode?: 'light' | 'dark'
}>()
// const mode = ref('dark')
</script>
