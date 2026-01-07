'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'

export default function LoginPage() {
  const t = useTranslations('auth')
  const tc = useTranslations('common')
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { user, token } = await authApi.login(formData)
      setAuth(user, token)
      toast.success('Login successful!')
      router.push('/')
    } catch (error: any) {
      toast.error(error.message || 'Invalid phone number or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/Logo Mark.svg"
              alt="Logo"
              width={60}
              height={60}
            />
          </div>

          <h1 className="text-2xl font-bold text-primary text-center mb-6">
            {t('loginTitle')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phone')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('phonePlaceholder')}
                className="input-field"
                required
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">{t('phoneFormat')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('passwordPlaceholder')}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? tc('loading') : t('loginButton')}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            {t('noAccount')}{' '}
            <Link href="/auth/register" className="text-secondary hover:underline font-medium">
              {tc('register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
