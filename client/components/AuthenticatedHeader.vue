<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
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
          <div v-if="user" class="flex items-center space-x-2">
            <div v-if="user.avatar" class="w-8 h-8 rounded-full overflow-hidden">
              <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ user.name || user.email }}</span>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
const { isDark } = useDarkMode()
const { user } = useAuth()
</script>

