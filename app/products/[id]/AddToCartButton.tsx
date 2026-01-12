'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart-store'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  price: number
  image: string
}

interface AddToCartButtonProps {
  product: Product
  locale: string
}

export default function AddToCartButton({ product, locale }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [showPopup, setShowPopup] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const cartItemCount = useCartStore((state) => state.getItemCount())
  const isArabic = locale === 'ar'

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.nameEn,
      nameAr: product.nameAr,
      price: product.price,
      quantity,
      image: product.image
    })
    setShowPopup(true)
  }

  return (
    <>
      {/* Quantity Selector */}
      <div className="flex items-center gap-3 border-2 border-gray-300 rounded-full w-fit px-2 py-1">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Image src="/images/Subtract Icon.svg" alt="decrease" width={14} height={14} />
        </button>
        <span className="text-xl font-semibold text-primary w-10 text-center">{quantity}</span>
        <button 
          onClick={() => setQuantity(quantity + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Image src="/images/Add Icon.svg" alt="increase" width={14} height={14} />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button onClick={handleAddToCart} className="btn-primary w-full py-2.5">
        <Image src="/images/Add Icon.svg" alt="add" width={18} height={18} />
        {isArabic ? 'أضف إلى السلة' : 'Add to cart'}
      </button>

      {/* Cart Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                {isArabic ? 'تمت الإضافة إلى السلة!' : 'Added to Cart!'}
              </h3>
              <p className="text-gray-600">
                {isArabic 
                  ? `${quantity} x ${product.nameAr}` 
                  : `${quantity} x ${product.nameEn}`
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {isArabic 
                  ? `${cartItemCount} منتجات في السلة` 
                  : `${cartItemCount} items in cart`
                }
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Link href="/cart">
                <button className="btn-primary w-full py-3">
                  {isArabic ? 'عرض السلة' : 'View Cart'}
                </button>
              </Link>
              <button 
                onClick={() => {
                  setShowPopup(false)
                  setQuantity(1)
                }}
                className="btn-outline w-full py-3"
              >
                {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

