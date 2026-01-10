const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.enabholding.com/api'
export const UPLOADS_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.enabholding.com'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  token?: string
  isFormData?: boolean
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, isFormData } = options

  const headers: HeadersInit = {}

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    cache: 'no-store', // Prevent browser caching for fresh data
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}

// Auth API
export const authApi = {
  register: (data: { phone: string; password: string; name?: string; email?: string }) =>
    request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: data }),
  
  login: (data: { phone: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: data }),
  
  getMe: (token: string) =>
    request<any>('/auth/me', { token }),
}

// Products API
export const productsApi = {
  getAll: (params?: { categoryId?: string; search?: string }) => {
    const queryParams = new URLSearchParams()
    if (params?.categoryId) queryParams.set('categoryId', params.categoryId)
    if (params?.search) queryParams.set('search', params.search)
    const query = queryParams.toString()
    return request<any[]>(`/products${query ? `?${query}` : ''}`)
  },
  
  getById: (id: string) =>
    request<any>(`/products/${id}`),
  
  create: (data: FormData, token: string) =>
    request<any>('/products', { method: 'POST', body: data, token, isFormData: true }),
  
  update: (id: string, data: FormData | any, token: string, isFormData = false) =>
    request<any>(`/products/${id}`, { method: 'PUT', body: data, token, isFormData }),
  
  delete: (id: string, token: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE', token }),
}

// Categories API
export const categoriesApi = {
  getAll: (flat?: boolean) => request<any[]>(`/categories${flat ? '?flat=true' : ''}`),
  
  getById: (id: string) => request<any>(`/categories/${id}`),
  
  create: (data: any, token: string) =>
    request<any>('/categories', { method: 'POST', body: data, token }),
  
  update: (id: string, data: any, token: string) =>
    request<any>(`/categories/${id}`, { method: 'PUT', body: data, token }),
  
  delete: (id: string, token: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE', token }),
}

// Orders API
export const ordersApi = {
  getAll: (token: string, status?: string) => {
    const query = status ? `?status=${status}` : ''
    return request<any[]>(`/orders${query}`, { token })
  },
  
  getById: (id: string, token: string) =>
    request<any>(`/orders/${id}`, { token }),
  
  create: (data: any, token: string) =>
    request<any>('/orders', { method: 'POST', body: data, token }),
  
  update: (id: string, data: any, token: string) =>
    request<any>(`/orders/${id}`, { method: 'PUT', body: data, token }),
}

// Coupons API
export const couponsApi = {
  getAll: (token: string) =>
    request<any[]>('/coupons', { token }),
  
  validate: (data: { code: string; subtotal: number }) =>
    request<any>('/coupons/validate', { method: 'POST', body: data }),
  
  create: (data: any, token: string) =>
    request<any>('/coupons', { method: 'POST', body: data, token }),
}

// Messages API
export const messagesApi = {
  getAll: (token: string, type?: string) => {
    const query = type ? `?type=${type}` : ''
    return request<any[]>(`/messages${query}`, { token })
  },
  
  create: (data: any, token: string) =>
    request<any>('/messages', { method: 'POST', body: data, token }),
  
  markAsRead: (id: string, token: string) =>
    request<any>(`/messages/${id}/read`, { method: 'PUT', token }),
}

// Bank Accounts API
export const bankAccountsApi = {
  getAll: () => request<any[]>('/bank-accounts'),
  
  create: (data: any, token: string) =>
    request<any>('/bank-accounts', { method: 'POST', body: data, token }),
}

// Support API
export const supportApi = {
  getAll: () => request<any[]>('/support'),
  
  create: (data: any, token: string) =>
    request<any>('/support', { method: 'POST', body: data, token }),
}

// Delivery Zones API
export const deliveryApi = {
  getAll: () => request<any[]>('/delivery-zones'),
  
  getPrice: (country: string, state: string) =>
    request<{ price: number }>(`/delivery-zones/price?country=${country}&state=${state}`),
}

// Users API
export const usersApi = {
  getAll: (token: string) =>
    request<any[]>('/users', { token }),
  
  getById: (id: string, token: string) =>
    request<any>(`/users/${id}`, { token }),
  
  create: (data: any, token: string) =>
    request<any>('/users', { method: 'POST', body: data, token }),
  
  update: (id: string, data: any, token: string) =>
    request<any>(`/users/${id}`, { method: 'PUT', body: data, token }),
  
  delete: (id: string, token: string) =>
    request<void>(`/users/${id}`, { method: 'DELETE', token }),
  
  updateProfile: (data: any, token: string) =>
    request<any>('/users/profile', { method: 'PUT', body: data, token }),
  
  updateLoyaltyPoints: (id: string, points: number, token: string) =>
    request<any>(`/users/${id}/loyalty`, { method: 'PUT', body: { points }, token }),
}

// Reports API
export const reportsApi = {
  getAll: (token: string) =>
    request<any>('/reports', { token }),
  
  getTopProducts: (token: string) =>
    request<any[]>('/reports/top-products', { token }),
  
  getTopCustomers: (token: string) =>
    request<any[]>('/reports/top-customers', { token }),
  
  getProfitLoss: (token: string) =>
    request<any>('/reports/profit-loss', { token }),
}

// Procurement API
export const procurementApi = {
  getAll: (token: string) =>
    request<any[]>('/procurement', { token }),
  
  create: (data: any, token: string) =>
    request<any>('/procurement', { method: 'POST', body: data, token }),
}

export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  orders: ordersApi,
  coupons: couponsApi,
  messages: messagesApi,
  bankAccounts: bankAccountsApi,
  support: supportApi,
  delivery: deliveryApi,
  users: usersApi,
  procurement: procurementApi,
  reports: reportsApi,
}

