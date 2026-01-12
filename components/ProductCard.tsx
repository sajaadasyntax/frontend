'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { UPLOADS_URL } from '@/lib/api'

interface ProductCardProps {
  id: string
  nameEn: string
  nameAr: string
  price: number
  image?: string
  isSale?: boolean
  isNew?: boolean
  discount?: number
  loyaltyPointsEnabled?: boolean
  loyaltyPointsValue?: number
  hasRecipes?: boolean
}

export default function ProductCard({ 
  id, 
  nameEn, 
  nameAr, 
  price, 
  image, 
  isSale, 
  isNew,
  discount,
  loyaltyPointsEnabled,
  loyaltyPointsValue,
  hasRecipes
}: ProductCardProps) {
  const t = useTranslations('home')
  const tc = useTranslations('common')
  const { locale } = useLocaleStore()
  
  const name = locale === 'ar' ? nameAr : nameEn
  const displayPrice = discount ? price - (price * discount / 100) : price

  const getImageSrc = (img?: string) => {
    if (!img) return '/images/product-tube.png'
    if (img.startsWith('/uploads')) return `${UPLOADS_URL}${img}`
    return img
  }

  return (
    <div className="product-card relative p-3 md:p-5">
      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="flex justify-center items-center h-28 md:h-44 mb-2 md:mb-3 cursor-pointer">
          <Image
            src={getImageSrc(image)}
            alt={name}
            width={100}
            height={150}
            className="object-contain hover:scale-105 transition-transform w-16 h-24 md:w-[100px] md:h-[150px]"
          />
        </div>
      </Link>

      {/* Product Name */}
      <h3 className="text-center text-primary font-semibold text-[11px] md:text-[13px] mb-1 md:mb-2 line-clamp-2">{name}</h3>

      {/* Loyalty Points */}
      {loyaltyPointsEnabled && loyaltyPointsValue && loyaltyPointsValue > 0 && (
        <p className="text-center text-amber-600 text-[10px] md:text-xs mb-1 md:mb-2">
          ⭐ +{loyaltyPointsValue} {locale === 'ar' ? 'نقطة' : 'pts'}
        </p>
      )}

      {/* Price */}
      <div className="text-center mb-2 md:mb-3">
        <span className="text-gray-600 text-xs md:text-sm block md:inline">
          {tc('currency')} {displayPrice.toLocaleString()}
        </span>
        {discount && discount > 0 && (
          <span className="text-gray-400 line-through text-[10px] md:text-xs ml-0 md:ml-2 block md:inline">
            {tc('currency')} {price.toLocaleString()}
          </span>
        )}
      </div>

      {/* Shop Now Button */}
      <Link href={`/products/${id}`}>
        <button className="btn-primary w-full text-[10px] md:text-sm py-1.5 md:py-2 px-2 md:px-5">
          {t('shopNow')}
          <Image src="/images/Proceed Icon.svg" alt="proceed" width={12} height={12} className="w-3 h-3 md:w-[14px] md:h-[14px]" />
        </button>
      </Link>

      {/* Recipes Button */}
      {hasRecipes && (
        <a 
          href={`/recipes/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 md:mt-2 block"
        >
          <button className="w-full py-1.5 md:py-2 px-2 md:px-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-[10px] md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2">
            📋 {locale === 'ar' ? 'الوصفات' : 'Recipes'}
          </button>
        </a>
      )}
    </div>
  )
}
