<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <AuthenticatedHeader />

    <div class="flex">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-[73px] w-64 h-[calc(100vh-73px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40">
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <!-- Monitors -->
          <NuxtLink
            to="/dashboard"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="font-medium">Monitors</span>
          </NuxtLink>

          <!-- Status Pages -->
          <NuxtLink
            to="/dashboard/status-pages"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Status Pages</span>
          </NuxtLink>

          <!-- Reports -->
          <NuxtLink
            to="/dashboard/reports"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="font-medium">Reports</span>
          </NuxtLink>

          <!-- Settings -->
          <NuxtLink
            to="/dashboard/settings"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="font-medium">Settings</span>
          </NuxtLink>
        </nav>

        <!-- Profile and Logout at bottom -->
        <div class="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <NuxtLink
            to="/dashboard/profile"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400': $route.path === '/dashboard/profile' }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="font-medium">Profile</span>
          </NuxtLink>
          <button
            @click="handleLogout"
            class="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 ml-64 mt-[73px] px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header with Back Button -->
        <div class="mb-6">
          <NuxtLink :to="localePath('/dashboard')" class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Monitors
          </NuxtLink>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create Monitor</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">Configure a new uptime monitor for your service</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-red-800 dark:text-red-300">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Create Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Settings Card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Settings</h2>
            
            <div class="space-y-4">
              <!-- Monitor Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monitor Type *
                </label>
                <div class="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    @click="form.type = 'https'"
                    :class="[
                      'flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-all',
                      form.type === 'https'
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    ]"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    HTTP/HTTPS
                  </button>
                  <button
                    type="button"
                    @click="form.type = 'tcp'"
                    :class="[
                      'flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-all',
                      form.type === 'tcp'
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    ]"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    TCP
                  </button>
                </div>
              </div>

              <!-- Monitor Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monitor Name *
                </label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  maxlength="100"
                  placeholder="e.g., Production API"
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ form.name.length }}/100 characters</p>
              </div>

              <!-- URL -->
              <div>
                <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  id="url"
                  v-model="form.url"
                  type="text"
                  required
                  :placeholder="form.type === 'tcp' ? 'hostname:port (e.g., example.com:3306)' : 'https://example.com/api/health'"
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ form.type === 'tcp' ? 'Format: hostname:port' : 'Must start with http:// or https://' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Check Configuration -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check Configuration</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Check Interval -->
              <div>
                <label for="checkInterval" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check Interval (seconds)
                </label>
                <input
                  id="checkInterval"
                  v-model.number="form.checkInterval"
                  type="number"
                  min="180"
                  max="3600"
                  required
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">180-3600 seconds</p>
              </div>

              <!-- Check Timeout -->
              <div>
                <label for="checkTimeout" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timeout (seconds)
                </label>
                <input
                  id="checkTimeout"
                  v-model.number="form.checkTimeout"
                  type="number"
                  min="5"
                  max="120"
                  required
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">5-120 seconds</p>
              </div>

              <!-- Fail Threshold -->
              <div>
                <label for="failThreshold" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fail Threshold
                </label>
                <input
                  id="failThreshold"
                  v-model.number="form.failThreshold"
                  type="number"
                  min="1"
                  max="10"
                  required
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">1-10 failures</p>
              </div>
            </div>
          </div>

          <!-- HTTP Settings (only for HTTPS type) - Accordion -->
          <div v-if="form.type === 'https'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="httpSettingsExpanded = !httpSettingsExpanded"
              class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">HTTP Settings</h2>
              <svg
                :class="['w-5 h-5 text-gray-500 transition-transform', httpSettingsExpanded ? 'transform rotate-180' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div v-show="httpSettingsExpanded" class="px-6 pb-6 space-y-4">
              <!-- HTTP Method -->
              <div>
                <label for="httpMethod" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  HTTP Method
                </label>
                <select
                  id="httpMethod"
                  v-model="form.httpMethod"
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="HEAD">HEAD</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="OPTIONS">OPTIONS</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <!-- Follow Redirects -->
              <div class="flex items-center">
                <input
                  id="followRedirects"
                  v-model="form.followRedirects"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label for="followRedirects" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Follow redirects
                </label>
              </div>

              <!-- Request Headers -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Request Headers
                </label>
                <div class="space-y-2">
                  <div v-for="(header, index) in form.requestHeaders" :key="index" class="flex gap-2">
                    <input
                      v-model="header.key"
                      type="text"
                      placeholder="Header name"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      v-model="header.value"
                      type="text"
                      placeholder="Header value"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      @click="removeRequestHeader(index)"
                      class="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="addRequestHeader"
                    class="inline-flex items-center px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Header
                  </button>
                </div>
              </div>

              <!-- Expected Status Codes -->
              <div>
                <label for="expectedStatusCodes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Status Codes
                </label>
                <input
                  id="expectedStatusCodes"
                  v-model="expectedStatusCodesInput"
                  type="text"
                  placeholder="e.g., 200-299, 300, 301"
                  class="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Comma-separated list of status codes or ranges (e.g., 200-299, 300, 301)
                </p>
              </div>

              <!-- Expected Response Headers -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Response Headers
                </label>
                <div class="space-y-2">
                  <div v-for="(header, index) in form.expectedResponseHeaders" :key="index" class="flex gap-2">
                    <input
                      v-model="header.key"
                      type="text"
                      placeholder="Header name"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      v-model="header.value"
                      type="text"
                      placeholder="Expected value"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      @click="removeExpectedResponseHeader(index)"
                      class="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="addExpectedResponseHeader"
                    class="inline-flex items-center px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Header
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Custom Headers - Accordion -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="customHeadersExpanded = !customHeadersExpanded"
              class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Custom Headers</h2>
              <svg
                :class="['w-5 h-5 text-gray-500 transition-transform', customHeadersExpanded ? 'transform rotate-180' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div v-show="customHeadersExpanded" class="px-6 pb-6">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add custom headers to include in your monitor requests
              </p>
              <div class="space-y-2">
                <div v-for="(header, index) in form.customHeaders" :key="index" class="flex gap-2">
                  <input
                    v-model="header.key"
                    type="text"
                    placeholder="Header name (e.g., X-API-Key)"
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    v-model="header.value"
                    type="text"
                    placeholder="Header value"
                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    @click="removeCustomHeader(index)"
                    class="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addCustomHeader"
                  class="inline-flex items-center px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Custom Header
                </button>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end space-x-4">
            <NuxtLink
              :to="localePath('/dashboard')"
              class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </NuxtLink>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Creating...' : 'Create Monitor' }}
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'auth'
})

const { createMonitor, loading, error } = useMonitors()
const { logout } = useAuth()
const localePath = useLocalePath()

// Accordion state
const httpSettingsExpanded = ref(true)
const customHeadersExpanded = ref(false)

// Form data
const form = ref({
  type: 'https' as 'https' | 'tcp',
  name: '',
  url: '',
  httpMethod: 'HEAD',
  requestHeaders: [] as Array<{ key: string; value: string }>,
  followRedirects: true,
  expectedStatusCodes: ['200-299'],
  expectedResponseHeaders: [] as Array<{ key: string; value: string }>,
  checkInterval: 300,
  checkTimeout: 30,
  failThreshold: 3,
  contacts: [] as string[],
  customHeaders: [] as Array<{ key: string; value: string }>
})

// Expected status codes as comma-separated string
const expectedStatusCodesInput = ref('200-299')

// Watch for changes in type to reset URL
watch(() => form.value.type, () => {
  form.value.url = ''
})

// Watch for changes in expected status codes input
watch(expectedStatusCodesInput, (newValue) => {
  form.value.expectedStatusCodes = newValue
    .split(',')
    .map(code => code.trim())
    .filter(code => code.length > 0)
})

// Error message
const errorMessage = ref<string | null>(null)

// Header management
const addRequestHeader = () => {
  form.value.requestHeaders.push({ key: '', value: '' })
}

const removeRequestHeader = (index: number) => {
  form.value.requestHeaders.splice(index, 1)
}

const addExpectedResponseHeader = () => {
  form.value.expectedResponseHeaders.push({ key: '', value: '' })
}

const removeExpectedResponseHeader = (index: number) => {
  form.value.expectedResponseHeaders.splice(index, 1)
}

const addCustomHeader = () => {
  form.value.customHeaders.push({ key: '', value: '' })
}

const removeCustomHeader = (index: number) => {
  form.value.customHeaders.splice(index, 1)
}

// Form submission
const handleSubmit = async () => {
  errorMessage.value = null

  // Validate timeout is less than interval
  if (form.value.checkTimeout >= form.value.checkInterval) {
    errorMessage.value = 'Check timeout must be less than check interval'
    return
  }

  // Filter out empty headers
  const requestHeaders = form.value.requestHeaders.filter(h => h.key && h.value)
  const expectedResponseHeaders = form.value.expectedResponseHeaders.filter(h => h.key && h.value)
  const customHeaders = form.value.customHeaders.filter(h => h.key && h.value)

  // Prepare payload
  const payload: any = {
    type: form.value.type,
    name: form.value.name,
    url: form.value.url,
    checkInterval: form.value.checkInterval,
    checkTimeout: form.value.checkTimeout,
    failThreshold: form.value.failThreshold
  }

  // Add HTTP-specific fields
  if (form.value.type === 'https') {
    payload.httpMethod = form.value.httpMethod
    payload.followRedirects = form.value.followRedirects
    payload.expectedStatusCodes = form.value.expectedStatusCodes
    
    // Combine request headers with custom headers
    const allRequestHeaders = [...requestHeaders, ...customHeaders]
    if (allRequestHeaders.length > 0) {
      payload.requestHeaders = allRequestHeaders
    }
    
    if (expectedResponseHeaders.length > 0) {
      payload.expectedResponseHeaders = expectedResponseHeaders
    }
  }

  try {
    await createMonitor(payload)
    // Redirect to dashboard on success
    navigateTo(localePath('/dashboard'))
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create monitor'
  }
}

const handleLogout = () => {
  logout()
  navigateTo(localePath('/login'))
}
</script>

