<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-2xl font-bold text-indigo-600">
              {{ $t('nav.brand') }}
            </NuxtLink>
            <a href="https://9headache.com" target="_blank">
              <img src="/logos/9headache.svg" alt="9headache" class="ml-2 h-8 align-self-bottom" />
            </a>
            <span class="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full">Beta</span>
          </div>
          <div class="flex items-center space-x-4">
            <NuxtLink :to="localePath('/login')" class="text-gray-700 hover:text-indigo-600 transition-colors">
              {{ $t('nav.login') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/signup')" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              {{ $t('nav.signup') }}
            </NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {{ $t('hero.title') }}
          <span class="block text-indigo-600">{{ $t('hero.subtitle') }}</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {{ $t('hero.description') }}
        </p>
        <div class="flex justify-center space-x-4">
          <NuxtLink :to="localePath('/signup')" class="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg">
            {{ $t('hero.cta_primary') }}
          </NuxtLink>
          <a href="#features" class="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-indigo-600">
            {{ $t('hero.cta_secondary') }}
          </a>
        </div>
      </div>

      <!-- Features Section -->
      <div id="features" class="mt-32">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
          {{ $t('features.title') }}
        </h2>
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ $t('features.realtime.title') }}</h3>
            <p class="text-gray-600">
              {{ $t('features.realtime.description') }}
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ $t('features.alerts.title') }}</h3>
            <p class="text-gray-600">
              {{ $t('features.alerts.description') }}
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ $t('features.analytics.title') }}</h3>
            <p class="text-gray-600">
              {{ $t('features.analytics.description') }}
            </p>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-32 bg-indigo-600 rounded-2xl p-12 text-center shadow-xl">
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ $t('cta.title') }}
        </h2>
        <p class="text-indigo-100 text-lg mb-8">
          {{ $t('cta.description') }}
        </p>
        <NuxtLink :to="localePath('/signup')" class="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-block shadow-lg">
          {{ $t('cta.button') }}
        </NuxtLink>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 mt-20 py-12 text-gray-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Brand Section -->
          <div class="col-span-1">
            <h3 class="text-white text-xl font-bold mb-4">{{ $t('nav.brand') }}</h3>
            <p class="text-sm text-gray-400">
              {{ $t('hero.description') }}
            </p>
          </div>

          <!-- Company Links -->
          <div>
            <h4 class="text-white font-semibold mb-4">Company</h4>
            <ul class="space-y-2">
              <li>
                <NuxtLink :to="localePath('/about')" class="text-sm hover:text-indigo-400 transition-colors">
                  {{ $t('footer.about') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/contact')" class="text-sm hover:text-indigo-400 transition-colors">
                  {{ $t('footer.contact') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div>
            <h4 class="text-white font-semibold mb-4">Legal</h4>
            <ul class="space-y-2">
              <li>
                <NuxtLink :to="localePath('/privacy')" class="text-sm hover:text-indigo-400 transition-colors">
                  {{ $t('footer.privacy') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/terms')" class="text-sm hover:text-indigo-400 transition-colors">
                  {{ $t('footer.terms') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="localePath('/cookies')" class="text-sm hover:text-indigo-400 transition-colors">
                  {{ $t('footer.cookies') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Language Selector -->
          <div>
            <h4 class="text-white font-semibold mb-4">{{ $t('footer.language') }}</h4>
            <div class="relative">
              <select
                v-model="selectedLocale"
                @change="changeLanguage"
                class="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded-lg px-4 py-2 pr-8 appearance-none cursor-pointer hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option
                  v-for="loc in locales"
                  :key="loc.code"
                  :value="loc.code"
                >
                  {{ loc.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="border-t border-gray-800 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p class="text-sm text-gray-400">
              &copy; {{ new Date().getFullYear() }} {{ $t('footer.copyright') }}
            </p>
            <div class="flex space-x-6">
              <a href="#" class="text-gray-400 hover:text-indigo-400 transition-colors">
                <span class="sr-only">Twitter</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-indigo-400 transition-colors">
                <span class="sr-only">GitHub</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                </svg>
              </a>
              <a href="#" class="text-gray-400 hover:text-indigo-400 transition-colors">
                <span class="sr-only">LinkedIn</span>
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

const selectedLocale = ref(locale.value)

const changeLanguage = async () => {
  await navigateTo(switchLocalePath(selectedLocale.value))
}

watch(locale, (newLocale) => {
  selectedLocale.value = newLocale
})
</script>