'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth-store'
import { usersApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const t = useTranslations('profile')
  const tc = useTranslations('common')
  const { isAuthenticated, user, token } = useAuthStore()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    country: 'Sudan',
    state: 'Kassala',
    address: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }))
    }
  }, [isAuthenticated, user, router])

  const handleSave = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      await usersApi.updateProfile(formData, token)
      toast.success('Profile updated!')
    } catch {
      toast.error('Error saving profile')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'personal', label: t('personalInfo') },
    { id: 'password', label: t('passwordManager') },
    { id: 'history', label: t('paymentHistory') },
    { id: 'settings', label: t('settings') }
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">{t('title')}</h1>

        <div className="card">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-primary font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-primary font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('namePlaceholder')}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-primary font-semibold mb-2">Phone number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('phonePlaceholder')}
                      className="input-field"
                      dir="ltr"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-primary font-semibold mb-2">Email address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('emailPlaceholder')}
                      className="input-field"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-primary font-bold mb-2">{t('deliveryAddress')}:</label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Country</label>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="select-field"
                        >
                          <option>Sudan</option>
                          <option>Egypt</option>
                          <option>Saudi Arabia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">State</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="select-field"
                        >
                          <option>Kassala</option>
                          <option>Khartoum</option>
                          <option>Port Sudan</option>
                          <option>Omdurman</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Street, home address"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? tc('loading') : tc('save')}
                  </button>
                </div>
              )}

              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-primary font-semibold mb-2">Current Password</label>
                    <input type="password" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-primary font-semibold mb-2">New Password</label>
                    <input type="password" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-primary font-semibold mb-2">Confirm New Password</label>
                    <input type="password" className="input-field" />
                  </div>
                  <button className="btn-primary">{tc('save')}</button>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <p className="text-gray-600">View your payment history in the Invoices page.</p>
                  <button
                    onClick={() => router.push('/invoices')}
                    className="btn-primary mt-4"
                  >
                    View Invoices
                  </button>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Language / اللغة</span>
                    <select className="select-field w-40">
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Notifications</span>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
