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
  isActive: boolean
  createdAt: string
  _count?: {
    orders: number
  }
}

interface Order {
  id: string
  invoiceNumber: string
  status: string
  paymentStatus: string
  total: number
  createdAt: string
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
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState(initialFormState)
  const [saving, setSaving] = useState(false)
  const [showOrdersModal, setShowOrdersModal] = useState(false)
  const [selectedUserOrders, setSelectedUserOrders] = useState<Order[]>([])
  const [selectedUserName, setSelectedUserName] = useState('')
  const [loadingOrders, setLoadingOrders] = useState(false)

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

  const handleToggleActive = async (user: User) => {
    if (!token) return
    
    const newStatus = !user.isActive
    const confirmMsg = newStatus
      ? (isArabic ? `هل تريد تفعيل ${user.name || user.phone}؟` : `Activate ${user.name || user.phone}?`)
      : (isArabic ? `هل تريد إلغاء تفعيل ${user.name || user.phone}؟` : `Deactivate ${user.name || user.phone}?`)
    
    if (!confirm(confirmMsg)) return

    try {
      await usersApi.update(user.id, { isActive: newStatus }, token)
      toast.success(newStatus 
        ? (isArabic ? 'تم تفعيل المستخدم' : 'User activated')
        : (isArabic ? 'تم إلغاء تفعيل المستخدم' : 'User deactivated')
      )
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message || (isArabic ? 'خطأ' : 'Error'))
    }
  }

  const viewOrderHistory = async (user: User) => {
    if (!token) return
    
    setSelectedUserName(user.name || user.phone)
    setShowOrdersModal(true)
    setLoadingOrders(true)
    
    try {
      const orders = await usersApi.getOrders(user.id, token)
      setSelectedUserOrders(orders)
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل الطلبات' : 'Error loading orders')
      setSelectedUserOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  // Statistics
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    regularUsers: users.filter(u => u.role === 'USER').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  }

  const filteredUsers = users
    .filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (statusFilter === 'active' && !u.isActive) return false
      if (statusFilter === 'inactive' && u.isActive) return false
      return true
    })
    .filter(u => 
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-primary">
          {isArabic ? 'المستخدمين' : 'Users'}
        </h1>
        <button onClick={openAddModal} className="btn-primary w-full sm:w-auto">
          ➕ {isArabic ? 'إضافة مستخدم' : 'Add User'}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 md:mb-6">
        <div className="bg-white rounded-xl shadow-md p-3 md:p-4 text-center">
          <p className="text-gray-600 text-xs md:text-sm">{isArabic ? 'الإجمالي' : 'Total'}</p>
          <p className="text-xl md:text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-md p-3 md:p-4 text-center">
          <p className="text-purple-600 text-xs md:text-sm">{isArabic ? 'المدراء' : 'Admins'}</p>
          <p className="text-xl md:text-2xl font-bold text-purple-700">{stats.admins}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-md p-3 md:p-4 text-center">
          <p className="text-blue-600 text-xs md:text-sm">{isArabic ? 'المستخدمين' : 'Users'}</p>
          <p className="text-xl md:text-2xl font-bold text-blue-700">{stats.regularUsers}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-md p-3 md:p-4 text-center">
          <p className="text-green-600 text-xs md:text-sm">{isArabic ? 'نشط' : 'Active'}</p>
          <p className="text-xl md:text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-md p-3 md:p-4 text-center col-span-2 md:col-span-1">
          <p className="text-red-600 text-xs md:text-sm">{isArabic ? 'غير نشط' : 'Inactive'}</p>
          <p className="text-xl md:text-2xl font-bold text-red-700">{stats.inactive}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 md:mb-6">
        <input
          type="text"
          placeholder={isArabic ? 'البحث عن مستخدم...' : 'Search users...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field w-full md:max-w-md"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="select-field w-full md:w-auto"
        >
          <option value="all">{isArabic ? 'كل الأدوار' : 'All Roles'}</option>
          <option value="ADMIN">{isArabic ? 'المدراء' : 'Admins'}</option>
          <option value="USER">{isArabic ? 'المستخدمين' : 'Users'}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field w-full md:w-auto"
        >
          <option value="all">{isArabic ? 'كل الحالات' : 'All Status'}</option>
          <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
          <option value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
        </select>
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
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full min-w-[900px]">
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
                          onClick={() => viewOrderHistory(user)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          title={isArabic ? 'سجل الطلبات' : 'Order History'}
                        >
                          📋
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {isArabic ? 'تعديل' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`px-3 py-1 rounded hover:opacity-80 ${
                            user.isActive 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {user.isActive 
                            ? (isArabic ? 'تعطيل' : 'Deactivate')
                            : (isArabic ? 'تفعيل' : 'Activate')
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-primary">{user.name || '-'}</p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                    {user.email && <p className="text-xs text-gray-400">{user.email}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'ADMIN' ? (isArabic ? 'مدير' : 'Admin') : (isArabic ? 'مستخدم' : 'User')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div className="text-center bg-gray-50 rounded p-2">
                    <p className="text-gray-600 text-xs">{isArabic ? 'الطلبات' : 'Orders'}</p>
                    <p className="font-semibold">{user._count?.orders || 0}</p>
                  </div>
                  <div className="text-center bg-yellow-50 rounded p-2">
                    <p className="text-gray-600 text-xs">{isArabic ? 'النقاط' : 'Points'}</p>
                    <p className="font-semibold">⭐ {user.loyaltyPoints}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded p-2">
                    <p className="text-gray-600 text-xs">{isArabic ? 'انضم' : 'Joined'}</p>
                    <p className="font-semibold text-xs">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => viewOrderHistory(user)}
                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded text-sm"
                  >
                    📋 {isArabic ? 'الطلبات' : 'Orders'}
                  </button>
                  <button
                    onClick={() => openEditModal(user)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm"
                  >
                    {isArabic ? 'تعديل' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`px-3 py-2 rounded text-sm ${
                      user.isActive 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {user.isActive ? '🚫' : '✅'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              {isArabic ? 'لا يوجد مستخدمين' : 'No users found'}
            </p>
          )}
        </>
      )}

      {/* Order History Modal */}
      {showOrdersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-primary">
                {isArabic ? `سجل طلبات ${selectedUserName}` : `Order History - ${selectedUserName}`}
              </h2>
              <button
                onClick={() => setShowOrdersModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {loadingOrders ? (
              <p className="text-center py-8 text-gray-600">
                {isArabic ? 'جاري التحميل...' : 'Loading...'}
              </p>
            ) : selectedUserOrders.length === 0 ? (
              <p className="text-center py-8 text-gray-600">
                {isArabic ? 'لا توجد طلبات' : 'No orders found'}
              </p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">{isArabic ? 'رقم الفاتورة' : 'Invoice #'}</th>
                    <th className="text-center p-3">{isArabic ? 'حالة الطلب' : 'Status'}</th>
                    <th className="text-center p-3">{isArabic ? 'حالة الدفع' : 'Payment'}</th>
                    <th className="text-center p-3">{isArabic ? 'المبلغ' : 'Amount'}</th>
                    <th className="text-center p-3">{isArabic ? 'التاريخ' : 'Date'}</th>
                    <th className="text-center p-3">{isArabic ? 'عرض' : 'View'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedUserOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-semibold text-primary">{order.invoiceNumber}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.paymentStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-center font-semibold">SDG {order.total.toLocaleString()}</td>
                      <td className="p-3 text-center text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center">
                        <a
                          href={`/admin/invoices/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          👁
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
