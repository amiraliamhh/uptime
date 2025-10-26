export const useDarkMode = () => {
  const isDark = useState('darkMode', () => false)
  const colorMode = useCookie('color-mode', {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  })

  if (colorMode.value === 'dark') {
    isDark.value = true
  } else if (colorMode.value === 'light') {
    isDark.value = false
  } else {
    isDark.value = false
  }

  // Initialize dark mode from cookie or system preference
  const initDarkMode = () => {
    if (process.client) {
      if (colorMode.value === 'dark') {
        isDark.value = true
        document.documentElement.classList.add('dark')
      } else if (colorMode.value === 'light') {
        isDark.value = false
        document.documentElement.classList.remove('dark')
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        isDark.value = prefersDark
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        }
      }
    }
  }

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    colorMode.value = isDark.value ? 'dark' : 'light'
    
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      }
    }
  }

  const setDarkMode = (value: boolean) => {
    isDark.value = value
    colorMode.value = value ? 'dark' : 'light'
    
    if (process.client) {
      if (value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  return {
    isDark: readonly(isDark),
    toggleDarkMode,
    setDarkMode,
    initDarkMode
  }
}

