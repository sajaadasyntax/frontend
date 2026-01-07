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
  loyaltyPoints: number
}

export default function LoyaltyPointsPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [pointsToAdd, setPointsToAdd] = useState('')

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
      toast.error('Error loading users')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPoints = async (userId: string) => {
    if (!pointsToAdd || parseInt(pointsToAdd) <= 0 || !token) {
      toast.error(isArabic ? 'يرجى إدخال عدد النقاط' : 'Please enter points')
      return
    }

    try {
      await usersApi.updateLoyaltyPoints(userId, parseInt(pointsToAdd), token)
      toast.success(isArabic ? 'تم إضافة النقاط بنجاح' : 'Points added successfully')
      setSelectedUser(null)
      setPointsToAdd('')
      fetchUsers()
    } catch {
      toast.error(isArabic ? 'خطأ في إضافة النقاط' : 'Error adding points')
    }
  }

  const totalPoints = users.reduce((sum, user) => sum + user.loyaltyPoints, 0)

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">
        {isArabic ? 'نقاط الولاء' : 'Loyalty Points'}
      </h1>

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm">{isArabic ? 'إجمالي المستخدمين' : 'Total Users'}</p>
          <p className="text-2xl font-bold text-primary mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm">{isArabic ? 'إجمالي النقاط' : 'Total Points'}</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">⭐ {totalPoints.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm">{isArabic ? 'متوسط النقاط' : 'Average Points'}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {users.length > 0 ? Math.round(totalPoints / users.length) : 0}
          </p>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="text-left p-4">{isArabic ? 'المستخدم' : 'User'}</th>
                <th className="text-center p-4">{isArabic ? 'رقم الهاتف' : 'Phone'}</th>
                <th className="text-center p-4">{isArabic ? 'النقاط' : 'Points'}</th>
                <th className="text-center p-4">{isArabic ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-semibold text-primary">{user.name || '-'}</p>
                    {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
                  </td>
                  <td className="text-center p-4">{user.phone}</td>
                  <td className="text-center p-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                      ⭐ {user.loyaltyPoints}
                    </span>
                  </td>
                  <td className="text-center p-4">
                    {selectedUser === user.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          value={pointsToAdd}
                          onChange={(e) => setPointsToAdd(e.target.value)}
                          placeholder="0"
                          className="input-field w-24 py-1 text-center"
                          min="1"
                        />
                        <button
                          onClick={() => handleAddPoints(user.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(null)
                            setPointsToAdd('')
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedUser(user.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {isArabic ? 'إضافة نقاط' : 'Add Points'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <p className="text-center text-gray-600 py-8">
              {isArabic ? 'لا يوجد مستخدمين' : 'No users found'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
