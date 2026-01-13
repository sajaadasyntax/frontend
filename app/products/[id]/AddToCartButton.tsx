'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store/cart-store'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  price: number
  image: string
  stock: number
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
  
  const isOutOfStock = product.stock <= 0
  const maxQuantity = product.stock

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error(isArabic ? 'هذا المنتج غير متوفر حالياً' : 'This product is out of stock')
      return
    }
    
    if (quantity > maxQuantity) {
      toast.error(isArabic ? `الكمية المتاحة فقط ${maxQuantity}` : `Only ${maxQuantity} available in stock`)
      return
    }

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

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    } else {
      toast.error(isArabic ? `الكمية المتاحة فقط ${maxQuantity}` : `Only ${maxQuantity} available`)
    }
  }

  if (isOutOfStock) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-semibold">
          {isArabic ? '😔 هذا المنتج غير متوفر حالياً' : '😔 This product is currently out of stock'}
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Quantity Selector */}
      <div className="flex items-center gap-2 md:gap-3 border-2 border-gray-300 rounded-full w-fit px-2 py-0.5 md:py-1">
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Image src="/images/Subtract Icon.svg" alt="decrease" width={14} height={14} className="w-3 h-3 md:w-[14px] md:h-[14px]" />
        </button>
        <span className="text-lg md:text-xl font-semibold text-primary w-8 md:w-10 text-center">{quantity}</span>
        <button 
          onClick={incrementQuantity}
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Image src="/images/Add Icon.svg" alt="increase" width={14} height={14} className="w-3 h-3 md:w-[14px] md:h-[14px]" />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button onClick={handleAddToCart} className="btn-primary w-full py-2 md:py-2.5 text-sm md:text-base">
        <Image src="/images/Add Icon.svg" alt="add" width={18} height={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
        {isArabic ? 'أضف إلى السلة' : 'Add to cart'}
      </button>

      {/* Cart Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md text-center">
            <div className="mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-primary mb-1 md:mb-2">
                {isArabic ? 'تمت الإضافة إلى السلة!' : 'Added to Cart!'}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                {isArabic 
                  ? `${quantity} x ${product.nameAr}` 
                  : `${quantity} x ${product.nameEn}`
                }
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">
                {isArabic 
                  ? `${cartItemCount} منتجات في السلة` 
                  : `${cartItemCount} items in cart`
                }
              </p>
            </div>
            
            <div className="flex flex-col gap-2 md:gap-3">
              <Link href="/cart">
                <button className="btn-primary w-full py-2.5 md:py-3 text-sm md:text-base">
                  {isArabic ? 'عرض السلة' : 'View Cart'}
                </button>
              </Link>
              <button 
                onClick={() => {
                  setShowPopup(false)
                  setQuantity(1)
                }}
                className="btn-outline w-full py-2.5 md:py-3 text-sm md:text-base"
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

