'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { reportsApi } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'
]

interface TopProduct {
  productId: string
  name: string
  nameAr: string
  totalQuantity: number
  totalRevenue: number
}

interface TopCustomer {
  userId: string
  name: string
  phone: string
  email: string
  totalOrders: number
  totalSpent: number
}

interface ProfitLossData {
  chartData: Array<{
    day: string
    dayNum: number
    revenue: number
    cost: number
    profit: number
  }>
  summary: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalProcurementCost: number
    netProfit: number
  }
}

interface Product {
  id: string
  nameEn: string
  nameAr: string
}

export default function ReportsPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [loading, setLoading] = useState(true)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [profitLoss, setProfitLoss] = useState<ProfitLossData | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'customers' | 'profit' | 'single-product'>('products')
  
  // Date filter for main reports
  const [reportMonth, setReportMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  
  // Single product report states
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [singleProductReport, setSingleProductReport] = useState<any>(null)
  const [loadingSingleReport, setLoadingSingleReport] = useState(false)

  useEffect(() => {
    if (!token) return
    fetchAllReports()
    fetchProducts()
  }, [token, reportMonth])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.enabholding.com/api'}/products`)
      const data = await response.json()
      setAllProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchSingleProductReport = async () => {
    if (!token || !selectedProductId) {
      toast.error(isArabic ? 'يرجى اختيار منتج' : 'Please select a product')
      return
    }
    
    setLoadingSingleReport(true)
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.enabholding.com/api'}/reports/product/${selectedProductId}`
      const params = new URLSearchParams()
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (params.toString()) url += `?${params.toString()}`
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setSingleProductReport(data)
    } catch (error) {
      toast.error(isArabic ? 'خطأ في تحميل التقرير' : 'Error loading report')
    } finally {
      setLoadingSingleReport(false)
    }
  }

  const fetchAllReports = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      // Parse month filter
      const [year, month] = reportMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()
      
      const [products, customers, pnl] = await Promise.all([
        reportsApi.getTopProducts(token, startDate, endDate),
        reportsApi.getTopCustomers(token, startDate, endDate),
        reportsApi.getProfitLoss(token, startDate, endDate)
      ])
      
      setTopProducts(products)
      setTopCustomers(customers)
      setProfitLoss(pnl)
    } catch (error) {
      toast.error(isArabic ? 'خطأ في تحميل التقارير' : 'Error loading reports')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => `SDG ${value.toLocaleString()}`

  // Prepare data for pie charts
  const productsPieData = topProducts.map((p, i) => ({
    name: isArabic ? p.nameAr : p.name,
    value: p.totalQuantity,
    color: COLORS[i % COLORS.length]
  }))

  const customersPieData = topCustomers.map((c, i) => ({
    name: c.name || c.phone,
    value: c.totalSpent,
    color: COLORS[i % COLORS.length]
  }))

  // Filter profit/loss data to show only non-zero days for cleaner chart
  const profitChartData = profitLoss?.chartData.filter(d => d.revenue > 0 || d.cost > 0) || []

  const currentMonth = new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-600">{isArabic ? 'جاري تحميل التقارير...' : 'Loading reports...'}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-primary">
          {isArabic ? 'التقارير' : 'Reports'}
        </h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">{isArabic ? 'الشهر:' : 'Month:'}</label>
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="input-field py-2"
          />
        </div>
      </div>

      {/* Summary Cards */}
      {profitLoss && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">{isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              SDG {profitLoss.summary.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">{isArabic ? 'إجمالي التكاليف' : 'Total Costs'}</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              SDG {profitLoss.summary.totalCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">{isArabic ? 'تكاليف المشتريات' : 'Procurement Costs'}</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              SDG {profitLoss.summary.totalProcurementCost.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-gray-600 text-sm">{isArabic ? 'صافي الربح' : 'Net Profit'}</p>
            <p className={`text-2xl font-bold mt-1 ${profitLoss.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              SDG {profitLoss.summary.netProfit.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 md:mb-6 flex-wrap overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-xs md:text-base whitespace-nowrap ${
            activeTab === 'products' 
              ? 'bg-primary text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          📦 {isArabic ? 'أعلى المنتجات' : 'Top Products'}
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-3 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-xs md:text-base whitespace-nowrap ${
            activeTab === 'customers' 
              ? 'bg-primary text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          👥 {isArabic ? 'أعلى العملاء' : 'Top Customers'}
        </button>
        <button
          onClick={() => setActiveTab('profit')}
          className={`px-3 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-xs md:text-base whitespace-nowrap ${
            activeTab === 'profit' 
              ? 'bg-primary text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          📊 {isArabic ? 'الأرباح' : 'Profit & Loss'}
        </button>
        <button
          onClick={() => setActiveTab('single-product')}
          className={`px-3 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-xs md:text-base whitespace-nowrap ${
            activeTab === 'single-product' 
              ? 'bg-primary text-white' 
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          🔍 {isArabic ? 'منتج واحد' : 'Single Product'}
        </button>
      </div>

      {/* Charts Container */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        {/* Top Products Tab */}
        {activeTab === 'products' && (
          <div>
            <h2 className="text-lg md:text-xl font-bold text-primary mb-4 md:mb-6">
              {isArabic ? 'أعلى 10 منتجات مبيعاً هذا الشهر' : 'Top 10 Selling Products This Month'}
            </h2>
            
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8 md:py-12 text-sm md:text-base">
                {isArabic ? 'لا توجد بيانات مبيعات هذا الشهر' : 'No sales data for this month'}
              </p>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4 md:gap-8">
                <div className="h-[250px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productsPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius="70%"
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {productsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} units`, isArabic ? 'الكمية' : 'Quantity']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[300px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 md:p-3 text-xs md:text-sm">#</th>
                        <th className="text-left p-2 md:p-3 text-xs md:text-sm">{isArabic ? 'المنتج' : 'Product'}</th>
                        <th className="text-center p-2 md:p-3 text-xs md:text-sm">{isArabic ? 'الكمية' : 'Qty'}</th>
                        <th className="text-right p-2 md:p-3 text-xs md:text-sm">{isArabic ? 'الإيرادات' : 'Revenue'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {topProducts.map((product, i) => (
                        <tr key={product.productId} className="hover:bg-gray-50">
                          <td className="p-3">
                            <span 
                              className="w-6 h-6 rounded-full inline-flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td className="p-3 font-medium">{isArabic ? product.nameAr : product.name}</td>
                          <td className="p-3 text-center">{product.totalQuantity}</td>
                          <td className="p-3 text-right font-semibold text-green-600">
                            SDG {product.totalRevenue.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Customers Tab */}
        {activeTab === 'customers' && (
          <div>
            <h2 className="text-xl font-bold text-primary mb-6">
              {isArabic ? 'أعلى 10 عملاء هذا الشهر' : 'Top 10 Customers This Month'}
            </h2>
            
            {topCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                {isArabic ? 'لا توجد بيانات عملاء هذا الشهر' : 'No customer data for this month'}
              </p>
            ) : (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customersPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name.substring(0, 10)}... (${(percent * 100).toFixed(0)}%)`}
                      >
                        {customersPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value as number), isArabic ? 'المشتريات' : 'Spent']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3">#</th>
                        <th className="text-left p-3">{isArabic ? 'العميل' : 'Customer'}</th>
                        <th className="text-center p-3">{isArabic ? 'الطلبات' : 'Orders'}</th>
                        <th className="text-right p-3">{isArabic ? 'الإنفاق' : 'Spent'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {topCustomers.map((customer, i) => (
                        <tr key={customer.userId} className="hover:bg-gray-50">
                          <td className="p-3">
                            <span 
                              className="w-6 h-6 rounded-full inline-flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-medium">{customer.name || '-'}</p>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                          </td>
                          <td className="p-3 text-center">{customer.totalOrders}</td>
                          <td className="p-3 text-right font-semibold text-green-600">
                            SDG {customer.totalSpent.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profit & Loss Tab */}
        {activeTab === 'profit' && (
          <div>
            <h2 className="text-xl font-bold text-primary mb-6">
              {isArabic ? 'تقرير الأرباح والخسائر لهذا الشهر' : 'Profit & Loss Report This Month'}
            </h2>
            
            {profitChartData.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                {isArabic ? 'لا توجد بيانات هذا الشهر' : 'No data for this month'}
              </p>
            ) : (
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={profitChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value as number)}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name={isArabic ? 'الإيرادات' : 'Revenue'} 
                      fill="#22c55e" 
                    />
                    <Bar 
                      dataKey="cost" 
                      name={isArabic ? 'التكاليف' : 'Costs'} 
                      fill="#ef4444" 
                    />
                    <Bar 
                      dataKey="profit" 
                      name={isArabic ? 'الربح' : 'Profit'} 
                      fill="#3b82f6" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Summary Table */}
            {profitLoss && (
              <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    💰 {isArabic ? 'الإيرادات' : 'Revenue'}
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    SDG {profitLoss.summary.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">
                    📉 {isArabic ? 'التكاليف' : 'Costs'}
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    SDG {(profitLoss.summary.totalCost + profitLoss.summary.totalProcurementCost).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {isArabic ? 'تكاليف المنتجات' : 'Product costs'}: SDG {profitLoss.summary.totalCost.toLocaleString()}
                  </p>
                  <p className="text-sm text-red-700">
                    {isArabic ? 'تكاليف المشتريات' : 'Procurement'}: SDG {profitLoss.summary.totalProcurementCost.toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${profitLoss.summary.netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                  <h3 className={`font-semibold mb-2 ${profitLoss.summary.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                    📊 {isArabic ? 'صافي الربح' : 'Net Profit'}
                  </h3>
                  <p className={`text-2xl font-bold ${profitLoss.summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    SDG {profitLoss.summary.netProfit.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {isArabic ? 'هامش الربح' : 'Margin'}: {profitLoss.summary.totalRevenue > 0 
                      ? ((profitLoss.summary.netProfit / profitLoss.summary.totalRevenue) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Single Product Report Tab */}
        {activeTab === 'single-product' && (
          <div>
            <h2 className="text-xl font-bold text-primary mb-6">
              {isArabic ? 'تقرير منتج واحد' : 'Single Product Report'}
            </h2>
            
            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'المنتج' : 'Product'}
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="select-field"
                  >
                    <option value="">{isArabic ? 'اختر منتج' : 'Select Product'}</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isArabic ? p.nameAr : p.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'من تاريخ' : 'From Date'}
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isArabic ? 'إلى تاريخ' : 'To Date'}
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input-field"
                  />
                </div>
                <button
                  onClick={fetchSingleProductReport}
                  disabled={loadingSingleReport}
                  className="btn-primary"
                >
                  {loadingSingleReport 
                    ? (isArabic ? 'جاري التحميل...' : 'Loading...') 
                    : (isArabic ? 'عرض التقرير' : 'Show Report')
                  }
                </button>
              </div>
            </div>

            {/* Report Results */}
            {singleProductReport && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700">{isArabic ? 'إجمالي المبيعات' : 'Total Sales'}</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {singleProductReport.totalQuantity || 0} {isArabic ? 'وحدة' : 'units'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700">{isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
                    <p className="text-2xl font-bold text-green-800">
                      SDG {(singleProductReport.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-amber-700">{isArabic ? 'عدد الطلبات' : 'Orders Count'}</p>
                    <p className="text-2xl font-bold text-amber-800">
                      {singleProductReport.ordersCount || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-700">{isArabic ? 'المخزون الحالي' : 'Current Stock'}</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {singleProductReport.currentStock || 0}
                    </p>
                  </div>
                </div>

                {/* Orders List */}
                {singleProductReport.orders && singleProductReport.orders.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      {isArabic ? 'قائمة الطلبات' : 'Orders List'}
                    </h3>
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-3">{isArabic ? 'رقم الفاتورة' : 'Invoice #'}</th>
                          <th className="text-center p-3">{isArabic ? 'الكمية' : 'Quantity'}</th>
                          <th className="text-center p-3">{isArabic ? 'السعر' : 'Price'}</th>
                          <th className="text-center p-3">{isArabic ? 'التاريخ' : 'Date'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {singleProductReport.orders.map((order: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="p-3 font-mono">{order.invoiceNumber}</td>
                            <td className="p-3 text-center">{order.quantity}</td>
                            <td className="p-3 text-center">SDG {order.price?.toLocaleString()}</td>
                            <td className="p-3 text-center text-gray-600">
                              <div>{new Date(order.date).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {singleProductReport.orders && singleProductReport.orders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {isArabic ? 'لا توجد طلبات لهذا المنتج في الفترة المحددة' : 'No orders for this product in the selected period'}
                  </p>
                )}
              </div>
            )}

            {!singleProductReport && (
              <p className="text-center text-gray-500 py-12">
                {isArabic ? 'اختر منتج وانقر على عرض التقرير' : 'Select a product and click Show Report'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
