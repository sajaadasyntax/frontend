'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { bankAccountsApi, UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface BankAccount {
  id: string
  bankNameEn: string
  bankNameAr: string
  accountName: string
  accountNumber: string
  branchEn?: string
  branchAr?: string
  image?: string
  isActive: boolean
}

export default function BankAccountsPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [formData, setFormData] = useState({
    bankNameEn: '',
    bankNameAr: '',
    accountName: '',
    accountNumber: '',
    branchEn: '',
    branchAr: '',
    image: ''
  })

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      const data = await bankAccountsApi.getAll()
      setBankAccounts(data)
    } catch (error) {
      toast.error(isArabic ? 'خطأ في تحميل الحسابات البنكية' : 'Error loading bank accounts')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingAccount(null)
    setFormData({
      bankNameEn: '',
      bankNameAr: '',
      accountName: '',
      accountNumber: '',
      branchEn: '',
      branchAr: '',
      image: ''
    })
    setShowModal(true)
  }

  const openEditModal = (account: BankAccount) => {
    setEditingAccount(account)
    setFormData({
      bankNameEn: account.bankNameEn,
      bankNameAr: account.bankNameAr,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      branchEn: account.branchEn || '',
      branchAr: account.branchAr || '',
      image: account.image || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      if (editingAccount) {
        await bankAccountsApi.update(editingAccount.id, formData, token)
        toast.success(isArabic ? 'تم تحديث الحساب البنكي' : 'Bank account updated')
      } else {
        await bankAccountsApi.create(formData, token)
        toast.success(isArabic ? 'تمت إضافة الحساب البنكي' : 'Bank account added')
      }
      setShowModal(false)
      fetchBankAccounts()
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    if (!confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return

    try {
      await bankAccountsApi.delete(id, token)
      toast.success(isArabic ? 'تم حذف الحساب البنكي' : 'Bank account deleted')
      fetchBankAccounts()
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const getImageSrc = (img?: string) => {
    if (!img) return '/images/bank-card.png'
    if (img.startsWith('/uploads')) return `${UPLOADS_URL}${img}`
    return img
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">
          {isArabic ? 'إدارة الحسابات البنكية' : 'Bank Accounts Management'}
        </h1>
        <button onClick={openAddModal} className="btn-primary">
          {isArabic ? '+ إضافة حساب بنكي' : '+ Add Bank Account'}
        </button>
      </div>

      {/* Bank Accounts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {account.image && (
              <div className="relative h-48">
                <Image
                  src={getImageSrc(account.image)}
                  alt={isArabic ? account.bankNameAr : account.bankNameEn}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-primary text-lg mb-2">
                {isArabic ? account.bankNameAr : account.bankNameEn}
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">{isArabic ? 'اسم الحساب:' : 'Account Name:'}</span>{' '}
                  {account.accountName}
                </p>
                <p>
                  <span className="font-semibold">{isArabic ? 'رقم الحساب:' : 'Account Number:'}</span>{' '}
                  {account.accountNumber}
                </p>
                {account.branchEn && (
                  <p>
                    <span className="font-semibold">{isArabic ? 'الفرع:' : 'Branch:'}</span>{' '}
                    {isArabic ? account.branchAr : account.branchEn}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(account)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  {isArabic ? 'تعديل' : 'Edit'}
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  {isArabic ? 'حذف' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bankAccounts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {isArabic ? 'لا توجد حسابات بنكية' : 'No bank accounts found'}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingAccount
                ? (isArabic ? 'تعديل الحساب البنكي' : 'Edit Bank Account')
                : (isArabic ? 'إضافة حساب بنكي' : 'Add Bank Account')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'اسم البنك (إنجليزي)' : 'Bank Name (English)'}
                </label>
                <input
                  type="text"
                  value={formData.bankNameEn}
                  onChange={(e) => setFormData({ ...formData, bankNameEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'اسم البنك (عربي)' : 'Bank Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.bankNameAr}
                  onChange={(e) => setFormData({ ...formData, bankNameAr: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'اسم صاحب الحساب' : 'Account Holder Name'}
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'رقم الحساب' : 'Account Number'}
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الفرع (إنجليزي)' : 'Branch (English)'}
                </label>
                <input
                  type="text"
                  value={formData.branchEn}
                  onChange={(e) => setFormData({ ...formData, branchEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الفرع (عربي)' : 'Branch (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.branchAr}
                  onChange={(e) => setFormData({ ...formData, branchAr: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'رابط صورة البطاقة البنكية' : 'Bank Card Image URL'}
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="/images/bank-card.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isArabic 
                    ? 'أدخل رابط الصورة أو مسار الملف المحلي' 
                    : 'Enter image URL or local file path'}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingAccount
                    ? (isArabic ? 'تحديث' : 'Update')
                    : (isArabic ? 'إضافة' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

