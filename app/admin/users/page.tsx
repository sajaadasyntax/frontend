'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { usersApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: string
  name: string
  phone: string
  email: string
  role: string
  loyaltyPoints: number
  country: string
  state: string
  address: string
  createdAt: string
  _count?: {
    orders: number
  }
}

const initialFormState = {
  phone: '',
  password: '',
  name: '',
  email: '',
  role: 'USER',
  loyaltyPoints: '0',
  country: '',
  state: '',
  address: ''
}

export default function UsersPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState(initialFormState)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) return
    fetchUsers()
  }, [token])

  const fetchUsers = async () => {
    if (!token) return
    
    try {
      const data = await usersApi.getAll(token)
      setUsers(data)
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل المستخدمين' : 'Error loading users')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingUser(null)
    setFormData(initialFormState)
    setShowModal(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      phone: user.phone,
      password: '',
      name: user.name || '',
      email: user.email || '',
      role: user.role,
      loyaltyPoints: user.loyaltyPoints.toString(),
      country: user.country || '',
      state: user.state || '',
      address: user.address || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setSaving(true)

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = { ...formData }
        if (!updateData.password) delete updateData.password
        delete updateData.phone // Can't change phone

        await usersApi.update(editingUser.id, updateData, token)
        toast.success(isArabic ? 'تم تحديث المستخدم بنجاح' : 'User updated successfully')
      } else {
        // Create new user
        if (!formData.password) {
          toast.error(isArabic ? 'كلمة المرور مطلوبة' : 'Password is required')
          setSaving(false)
          return
        }
        await usersApi.create(formData, token)
        toast.success(isArabic ? 'تم إضافة المستخدم بنجاح' : 'User added successfully')
      }

      setShowModal(false)
      setFormData(initialFormState)
      setEditingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'حدث خطأ' : 'An error occurred'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(isArabic ? `هل أنت متأكد من حذف ${user.name || user.phone}؟` : `Are you sure you want to delete ${user.name || user.phone}?`)) return
    if (!token) return

    try {
      await usersApi.delete(user.id, token)
      toast.success(isArabic ? 'تم حذف المستخدم' : 'User deleted')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ في الحذف' : 'Error deleting'))
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {isArabic ? 'المستخدمين' : 'Users'}
        </h1>
        <button onClick={openAddModal} className="btn-primary">
          ➕ {isArabic ? 'إضافة مستخدم' : 'Add User'}
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={isArabic ? 'البحث عن مستخدم...' : 'Search users...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingUser 
                ? (isArabic ? 'تعديل المستخدم' : 'Edit User')
                : (isArabic ? 'إضافة مستخدم جديد' : 'Add New User')
              }
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    required
                    disabled={!!editingUser}
                    placeholder="+249..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'كلمة المرور' : 'Password'} {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingUser}
                    placeholder={editingUser ? (isArabic ? 'اتركه فارغاً للإبقاء' : 'Leave empty to keep') : ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الدور' : 'Role'}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select-field"
                  >
                    <option value="USER">{isArabic ? 'مستخدم' : 'User'}</option>
                    <option value="ADMIN">{isArabic ? 'مدير' : 'Admin'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'نقاط الولاء' : 'Loyalty Points'}
                  </label>
                  <input
                    type="number"
                    value={formData.loyaltyPoints}
                    onChange={(e) => setFormData({ ...formData, loyaltyPoints: e.target.value })}
                    className="input-field"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الدولة' : 'Country'}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'الولاية' : 'State'}
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'العنوان' : 'Address'}
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field h-20"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingUser(null)
                    setFormData(initialFormState)
                  }}
                  className="btn-outline flex-1"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving 
                    ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                    : editingUser 
                    ? (isArabic ? 'تحديث' : 'Update')
                    : (isArabic ? 'إضافة' : 'Add')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left p-4">{isArabic ? 'المستخدم' : 'User'}</th>
                <th className="text-center p-4">{isArabic ? 'رقم الهاتف' : 'Phone'}</th>
                <th className="text-center p-4">{isArabic ? 'الدور' : 'Role'}</th>
                <th className="text-center p-4">{isArabic ? 'الطلبات' : 'Orders'}</th>
                <th className="text-center p-4">{isArabic ? 'النقاط' : 'Points'}</th>
                <th className="text-center p-4">{isArabic ? 'تاريخ التسجيل' : 'Joined'}</th>
                <th className="text-center p-4">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-semibold text-primary">{user.name || '-'}</p>
                    {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                  </td>
                  <td className="text-center p-4 font-mono">{user.phone}</td>
                  <td className="text-center p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      user.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'ADMIN' 
                        ? (isArabic ? 'مدير' : 'Admin')
                        : (isArabic ? 'مستخدم' : 'User')
                      }
                    </span>
                  </td>
                  <td className="text-center p-4">{user._count?.orders || 0}</td>
                  <td className="text-center p-4">
                    <span className="inline-flex items-center gap-1">
                      ⭐ {user.loyaltyPoints}
                    </span>
                  </td>
                  <td className="text-center p-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="text-center p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {isArabic ? 'تعديل' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        {isArabic ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              {isArabic ? 'لا يوجد مستخدمين' : 'No users found'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
