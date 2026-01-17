'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.enabholding.com/api'

interface DeliveryZone {
  id: string
  country: string
  state: string
  price: number
  isActive: boolean
  createdAt: string
}

export default function DeliveryZonesPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [formData, setFormData] = useState({
    country: '',
    state: '',
    price: ''
  })
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (token) fetchZones()
  }, [token])

  const fetchZones = async () => {
    try {
      const res = await fetch(`${API_URL}/delivery-zones?all=true`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setZones(data)
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل المناطق' : 'Error loading zones')
    } finally {
      setLoading(false)
    }
  }

  const openAddForm = () => {
    setEditingZone(null)
    setFormData({ country: '', state: '', price: '' })
    setShowForm(true)
  }

  const openEditForm = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setFormData({
      country: zone.country,
      state: zone.state,
      price: zone.price.toString()
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingZone(null)
    setFormData({ country: '', state: '', price: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSaving(true)
    try {
      const url = editingZone 
        ? `${API_URL}/delivery-zones/${editingZone.id}`
        : `${API_URL}/delivery-zones`
      
      const res = await fetch(url, {
        method: editingZone ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success(editingZone 
        ? (isArabic ? 'تم تحديث المنطقة' : 'Zone updated')
        : (isArabic ? 'تم إضافة المنطقة' : 'Zone added')
      )
      closeForm()
      fetchZones()
    } catch {
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (zone: DeliveryZone) => {
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/delivery-zones/${zone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !zone.isActive })
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success(zone.isActive 
        ? (isArabic ? 'تم إلغاء تفعيل المنطقة' : 'Zone deactivated')
        : (isArabic ? 'تم تفعيل المنطقة' : 'Zone activated')
      )
      fetchZones()
    } catch {
      toast.error(isArabic ? 'خطأ في التحديث' : 'Error updating')
    }
  }

  const handleDelete = async (zone: DeliveryZone) => {
    if (!token) return
    if (!confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return

    try {
      const res = await fetch(`${API_URL}/delivery-zones/${zone.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success(isArabic ? 'تم الحذف' : 'Zone deleted')
      fetchZones()
    } catch {
      toast.error(isArabic ? 'خطأ في الحذف' : 'Error deleting')
    }
  }

  // Get unique countries for grouping
  const countries = [...new Set(zones.map(z => z.country))].sort()

  // Filter zones by search
  const filteredZones = zones.filter(z => 
    z.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    z.state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group by country
  const groupedZones = filteredZones.reduce((acc, zone) => {
    if (!acc[zone.country]) acc[zone.country] = []
    acc[zone.country].push(zone)
    return acc
  }, {} as Record<string, DeliveryZone[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-primary">
          🚚 {isArabic ? 'مناطق التوصيل' : 'Delivery Zones'}
        </h1>
        <button onClick={openAddForm} className="btn-primary">
          ➕ {isArabic ? 'إضافة منطقة' : 'Add Zone'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-gray-600 text-xs md:text-sm">{isArabic ? 'إجمالي المناطق' : 'Total Zones'}</p>
          <p className="text-xl md:text-2xl font-bold text-primary">{zones.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <p className="text-gray-600 text-xs md:text-sm">{isArabic ? 'الدول' : 'Countries'}</p>
          <p className="text-xl md:text-2xl font-bold text-blue-600">{countries.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-md p-4 text-center">
          <p className="text-green-600 text-xs md:text-sm">{isArabic ? 'نشط' : 'Active'}</p>
          <p className="text-xl md:text-2xl font-bold text-green-700">{zones.filter(z => z.isActive).length}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-4 text-center">
          <p className="text-red-600 text-xs md:text-sm">{isArabic ? 'غير نشط' : 'Inactive'}</p>
          <p className="text-xl md:text-2xl font-bold text-red-700">{zones.filter(z => !z.isActive).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={isArabic ? 'البحث عن دولة أو ولاية...' : 'Search country or state...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field w-full md:max-w-md"
        />
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingZone 
                ? (isArabic ? 'تعديل منطقة التوصيل' : 'Edit Delivery Zone')
                : (isArabic ? 'إضافة منطقة توصيل' : 'Add Delivery Zone')
              }
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الدولة' : 'Country'}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="input-field"
                  placeholder={isArabic ? 'مثال: السودان' : 'e.g., Sudan'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الولاية/المدينة' : 'State/City'}
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input-field"
                  placeholder={isArabic ? 'مثال: الخرطوم' : 'e.g., Khartoum'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'رسوم التوصيل (SDG)' : 'Delivery Fee (SDG)'}
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="3000"
                  required
                  min="0"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-outline flex-1"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving 
                    ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                    : (isArabic ? 'حفظ' : 'Save')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zones List - Grouped by Country */}
      <div className="space-y-6">
        {Object.keys(groupedZones).length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            {isArabic ? 'لا توجد مناطق توصيل' : 'No delivery zones found'}
          </div>
        ) : (
          Object.entries(groupedZones).map(([country, countryZones]) => (
            <div key={country} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold text-lg">🌍 {country}</h3>
                <span className="text-sm opacity-80">
                  {countryZones.length} {isArabic ? 'منطقة' : 'zones'}
                </span>
              </div>
              
              <div className="divide-y divide-gray-100">
                {countryZones.map((zone) => (
                  <div key={zone.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{zone.state}</p>
                      <p className="text-sm text-gray-500">
                        {isArabic ? 'رسوم التوصيل:' : 'Delivery fee:'} <span className="text-primary font-bold">SDG {zone.price.toLocaleString()}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(zone)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          zone.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {zone.isActive 
                          ? (isArabic ? 'نشط' : 'Active')
                          : (isArabic ? 'غير نشط' : 'Inactive')
                        }
                      </button>
                      <button
                        onClick={() => openEditForm(zone)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        {isArabic ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(zone)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        {isArabic ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

