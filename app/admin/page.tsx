'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { ordersApi, productsApi } from '@/lib/api'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  lowStockProducts: number
}

export default function AdminDashboard() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'
  
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockProducts: 0
  })

  useEffect(() => {
    if (!token) return
    
    // Fetch dashboard stats
    Promise.all([
      ordersApi.getAll(token),
      productsApi.getAll()
    ])
      .then(([orders, products]) => {
        const totalRevenue = orders.reduce((sum: number, order: any) => 
          order.paymentStatus === 'VERIFIED' ? sum + order.total : sum, 0
        )
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
          totalRevenue,
          totalProducts: products.length,
          totalUsers: 0, // Would need a separate API
          lowStockProducts: products.filter((p: any) => p.stock < 10).length
        })
      })
      .catch(() => {})
  }, [token])

  const statCards = [
    {
      title: isArabic ? 'إجمالي الطلبات' : 'Total Orders',
      value: stats.totalOrders,
      icon: '📦',
      color: 'bg-blue-500'
    },
    {
      title: isArabic ? 'طلبات معلقة' : 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'bg-yellow-500'
    },
    {
      title: isArabic ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `SDG ${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'bg-green-500'
    },
    {
      title: isArabic ? 'إجمالي المنتجات' : 'Total Products',
      value: stats.totalProducts,
      icon: '🛍️',
      color: 'bg-purple-500'
    },
    {
      title: isArabic ? 'منتجات منخفضة المخزون' : 'Low Stock',
      value: stats.lowStockProducts,
      icon: '⚠️',
      color: 'bg-red-500'
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-8">
        {isArabic ? 'لوحة التحكم' : 'Dashboard'}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-primary mb-4">
          {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/inventory/add" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <span className="text-2xl mb-2 block">➕</span>
            <span className="text-sm">{isArabic ? 'إضافة منتج' : 'Add Product'}</span>
          </a>
          <a href="/admin/invoices?status=PENDING" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <span className="text-2xl mb-2 block">📋</span>
            <span className="text-sm">{isArabic ? 'الطلبات المعلقة' : 'Pending Orders'}</span>
          </a>
          <a href="/admin/messages?compose=broadcast" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <span className="text-2xl mb-2 block">📢</span>
            <span className="text-sm">{isArabic ? 'رسالة جماعية' : 'Broadcast'}</span>
          </a>
          <a href="/admin/reports" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition-colors">
            <span className="text-2xl mb-2 block">📊</span>
            <span className="text-sm">{isArabic ? 'التقارير' : 'Reports'}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
