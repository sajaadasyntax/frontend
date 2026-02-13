'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth-store'
import { ordersApi, bankAccountsApi, UPLOADS_URL } from '@/lib/api'
import toast from 'react-hot-toast'

interface Order {
  id: string
  invoiceNumber: string
  total: number
  status: string
  paymentStatus: string
}

interface BankAccount {
  id: string
  bankNameEn: string
  bankNameAr: string
  accountName: string
  accountNumber: string
  branchEn: string
  branchAr: string
  image: string
}

export default function PaymentPage({ params }: { params: { id: string } }) {
  const t = useTranslations('payment')
  const tc = useTranslations('common')
  const { isAuthenticated, token } = useAuthStore()
  const router = useRouter()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/auth/login')
      return
    }

    // Fetch order details
    ordersApi.getById(params.id, token)
      .then(data => setOrder(data))
      .catch(() => toast.error('Error loading order'))

    // Fetch bank accounts
    bankAccountsApi.getAll()
      .then(data => setBankAccounts(data))
      .catch(() => {})
  }, [params.id, isAuthenticated, token, router])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedFile || !token) {
      toast.error('Please upload a transaction screenshot')
      return
    }

    setLoading(true)

    try {
      // Create FormData to upload the file
      const formData = new FormData()
      formData.append('paymentProof', selectedFile)

      await ordersApi.update(params.id, formData, token)

      toast.success('Payment submitted! Awaiting verification.')
      router.push(`/invoices/${params.id}`)
    } catch (error) {
      toast.error('Error confirming payment')
    } finally {
      setLoading(false)
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">{t('title')}</h1>

        {/* Invoice Info */}
        <div className="bg-primary text-white py-4 px-6 rounded-t-lg grid grid-cols-2 gap-4 font-semibold">
          <div>{t('invoiceNumber')}</div>
          <div className="text-right">{t('totalAmount')}</div>
        </div>

        <div className="bg-white border-b-2 border-gray-200 py-4 px-6 grid grid-cols-2 gap-4 shadow-sm">
          <div className="text-primary font-bold text-lg">{order.invoiceNumber}</div>
          <div className="text-right text-primary font-bold text-lg">
            {tc('currency')} {order.total.toLocaleString()}.00
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white p-8 shadow-md rounded-b-lg mb-8">
          <h2 className="text-xl text-center text-gray-700 mb-8 font-medium">
            {t('paymentInstructions')}
          </h2>

          {/* Bank Card */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              {bankAccounts.length > 0 && bankAccounts[0].image ? (
                <Image
                  src={bankAccounts[0].image.startsWith('/uploads') ? `${UPLOADS_URL}${bankAccounts[0].image}` : bankAccounts[0].image}
                  alt="Bank Card"
                  width={600}
                  height={380}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              ) : (
                <Image
                  src="/images/bank-card.png"
                  alt="Bank Card"
                  width={600}
                  height={380}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-secondary bg-secondary bg-opacity-10'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {selectedFile ? (
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-700 font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-gray-600">{t('dropOrSelect')}</p>
                </div>
              )}
            </label>
          </div>

          {/* Confirm Payment Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="btn-primary text-lg px-8"
            >
              {loading ? tc('loading') : t('confirmPayment')}
              <Image src="/images/Proceed Icon.svg" alt="proceed" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
