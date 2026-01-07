import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocaleState {
  locale: 'en' | 'ar'
  setLocale: (locale: 'en' | 'ar') => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => {
        document.cookie = `locale=${locale};path=/;max-age=31536000`
        set({ locale })
      }
    }),
    {
      name: 'locale-storage'
    }
  )
)

