'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.enabholding.com/api'

interface SiteSettings {
  id?: string
  bannerImage?: string
  supportPhone?: string
  supportEmail?: string
  supportWhatsapp?: string
  supportAddressEn?: string
  supportAddressAr?: string
  workingHoursEn?: string
  workingHoursAr?: string
}

export default function SettingsPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (token) fetchSettings()
  }, [token])

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data || {})
      }
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل الإعدادات' : 'Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)

    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (res.ok) {
        toast.success(isArabic ? 'تم حفظ الإعدادات' : 'Settings saved')
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(`${API_URL}/settings/banner`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, bannerImage: data.bannerImage }))
        toast.success(isArabic ? 'تم تحديث الصورة' : 'Banner updated')
      } else {
        throw new Error('Upload failed')
      }
    } catch {
      toast.error(isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const getImageSrc = (img?: string) => {
    if (!img) return '/images/banner.jpg'
    if (img.startsWith('/uploads')) return `${UPLOADS_URL}${img}`
    return img
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl md:text-3xl font-bold text-primary mb-6">
        {isArabic ? 'إعدادات الموقع' : 'Site Settings'}
      </h1>

      <div className="space-y-6">
        {/* Banner Image */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-primary mb-4">
            🖼️ {isArabic ? 'صورة البانر الرئيسية' : 'Main Banner Image'}
          </h2>
          
          <div className="space-y-4">
            <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={getImageSrc(settings.bannerImage)}
                alt="Banner"
                fill
                className="object-cover"
              />
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary"
            >
              {uploading 
                ? (isArabic ? 'جاري الرفع...' : 'Uploading...')
                : (isArabic ? 'تغيير الصورة' : 'Change Image')
              }
            </button>
            
            <p className="text-sm text-gray-500">
              {isArabic 
                ? 'يُفضل استخدام صورة بأبعاد 1920x600 بكسل'
                : 'Recommended size: 1920x600 pixels'
              }
            </p>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-primary mb-4">
            📞 {isArabic ? 'معلومات الدعم الفني' : 'Technical Support Information'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'رقم الهاتف' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={settings.supportPhone || ''}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="input-field"
                placeholder="+249 123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={settings.supportEmail || ''}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="input-field"
                placeholder="support@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'رقم الواتساب' : 'WhatsApp Number'}
              </label>
              <input
                type="text"
                value={settings.supportWhatsapp || ''}
                onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                className="input-field"
                placeholder="+249 123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'ساعات العمل (إنجليزي)' : 'Working Hours (English)'}
              </label>
              <input
                type="text"
                value={settings.workingHoursEn || ''}
                onChange={(e) => setSettings({ ...settings, workingHoursEn: e.target.value })}
                className="input-field"
                placeholder="Sun-Thu: 9AM-5PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'ساعات العمل (عربي)' : 'Working Hours (Arabic)'}
              </label>
              <input
                type="text"
                value={settings.workingHoursAr || ''}
                onChange={(e) => setSettings({ ...settings, workingHoursAr: e.target.value })}
                className="input-field"
                placeholder="الأحد-الخميس: 9ص-5م"
                dir="rtl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'العنوان (إنجليزي)' : 'Address (English)'}
              </label>
              <input
                type="text"
                value={settings.supportAddressEn || ''}
                onChange={(e) => setSettings({ ...settings, supportAddressEn: e.target.value })}
                className="input-field"
                placeholder="123 Main Street, Khartoum"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isArabic ? 'العنوان (عربي)' : 'Address (Arabic)'}
              </label>
              <input
                type="text"
                value={settings.supportAddressAr || ''}
                onChange={(e) => setSettings({ ...settings, supportAddressAr: e.target.value })}
                className="input-field"
                placeholder="123 الشارع الرئيسي، الخرطوم"
                dir="rtl"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary mt-6"
          >
            {saving 
              ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
              : (isArabic ? 'حفظ الإعدادات' : 'Save Settings')
            }
          </button>
        </div>
      </div>
    </div>
  )
}

