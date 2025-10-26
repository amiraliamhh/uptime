// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  devServer: {
    port: Number(process.env.CLIENT_PORT) || 6051,
  },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
        iso: 'en-US',
        file: 'en.json'
      },
      {
        code: 'es',
        name: 'Español',
        iso: 'es-ES',
        file: 'es.json'
      },
      {
        code: 'fr',
        name: 'Français',
        iso: 'fr-FR',
        file: 'fr.json'
      },
      {
        code: 'de',
        name: 'Deutsch',
        iso: 'de-DE',
        file: 'de.json'
      }
    ],
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    }
  },
  app: {
    head: {
      title: 'Uptime Monitor - 9headache',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Learn German with AI-powered spaced repetition and personalized learning paths.' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.svg' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ]
    }
  }
})