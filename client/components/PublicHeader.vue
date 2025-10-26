<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm dark:border-b dark:border-gray-700">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <NuxtLink to="/" class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ $t('nav.brand') }}
          </NuxtLink>
          <NhLogo :mode="isDark ? 'dark' : 'light'" class="ml-2 h-8" />
          <span class="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 rounded-full">Beta</span>
        </div>
        <div class="flex items-center space-x-4">
          <DarkModeToggle />
          <NuxtLink :to="localePath('/login')" class="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {{ $t('nav.login') }}
          </NuxtLink>
          <NuxtLink :to="localePath('/signup')" class="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
            {{ $t('nav.signup') }}
          </NuxtLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
const { isDark } = useDarkMode()
const localePath = useLocalePath()
</script>

