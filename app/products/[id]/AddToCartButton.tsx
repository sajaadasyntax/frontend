'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart-store'
import toast from 'react-hot-toast'

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
  const addItem = useCartStore((state) => state.addItem)
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
    toast.success(isArabic ? 'تمت الإضافة إلى السلة' : 'Added to cart!')
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
    </>
  )
}

