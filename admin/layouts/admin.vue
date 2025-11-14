<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center justify-center h-16 bg-gray-800">
          <h1 class="text-xl font-bold">Admin Panel</h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-2">
          <NuxtLink
            to="/dashboard"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
            :class="isActive('/dashboard') ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NuxtLink>
        </nav>

        <!-- User info and logout -->
        <div class="p-4 border-t border-gray-800">
          <div class="flex items-center mb-4">
            <div class="flex-1">
              <p class="text-sm font-medium text-white">{{ user?.name || user?.email }}</p>
              <p class="text-xs text-gray-400">{{ user?.email }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="pl-64">
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAdminAuth()
const router = useRouter()
const route = useRoute()

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = () => {
  logout()
  router.push('/')
}
</script>

