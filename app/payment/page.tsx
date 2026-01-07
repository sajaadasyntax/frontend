'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function PaymentPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  const handleConfirmPayment = () => {
    if (!selectedFile) {
      alert('Please upload a transaction screenshot')
      return
    }
    // Handle payment confirmation
    alert('Payment confirmed!')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">Payment</h1>

        {/* Invoice Info */}
        <div className="bg-primary text-white py-4 px-6 rounded-t-lg grid grid-cols-2 gap-4 font-semibold">
          <div>Invoice number</div>
          <div className="text-right">Total Amount</div>
        </div>

        <div className="bg-white border-b-2 border-gray-200 py-4 px-6 grid grid-cols-2 gap-4 shadow-sm">
          <div className="text-primary font-bold text-lg">SD10030300</div>
          <div className="text-right text-primary font-bold text-lg">SDG 38,000.00</div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-white p-8 shadow-md rounded-b-lg mb-8">
          <h2 className="text-xl text-center text-gray-700 mb-8 font-medium">
            Make the payment to the following account<br />
            and upload a screenshot of the transaction
          </h2>

          {/* Bank Card */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <Image
                src="/images/bank-card.png"
                alt="Bank Card"
                width={600}
                height={380}
                className="w-full h-auto rounded-lg shadow-lg"
              />
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
                  <p className="text-gray-600">Drop or select a file</p>
                </div>
              )}
            </label>
          </div>

          {/* Confirm Payment Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleConfirmPayment}
              className="btn-primary text-lg px-8"
            >
              Confirm Payment
              <Image src="/images/Proceed Icon.svg" alt="proceed" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

