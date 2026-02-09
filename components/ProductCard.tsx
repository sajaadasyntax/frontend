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
  isComingSoon?: boolean
  discount?: number
  loyaltyPointsEnabled?: boolean
  loyaltyPointsValue?: number
  hasRecipes?: boolean
  stock?: number
}

export default function ProductCard({ 
  id, 
  nameEn, 
  nameAr, 
  price, 
  image, 
  isSale, 
  isNew,
  isComingSoon,
  discount,
  loyaltyPointsEnabled,
  loyaltyPointsValue,
  hasRecipes,
  stock = 0
}: ProductCardProps) {
  const t = useTranslations('home')
  const tc = useTranslations('common')
  const { locale } = useLocaleStore()
  
  const name = locale === 'ar' ? nameAr : nameEn
  const displayPrice = discount ? price - (price * discount / 100) : price
  const isOutOfStock = stock <= 0
  const isUnavailable = isOutOfStock || isComingSoon

  const getImageSrc = (img?: string) => {
    if (!img) return '/images/product-tube.png'
    if (img.startsWith('/uploads')) return `${UPLOADS_URL}${img}`
    return img
  }

  return (
    <div className="product-card relative p-3 md:p-5">
      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="relative w-[calc(100%+1.5rem)] md:w-[calc(100%+2.5rem)] h-32 md:h-48 -mx-3 md:-mx-5 -mt-3 md:-mt-5 mb-2 md:mb-3 cursor-pointer overflow-hidden rounded-t-xl bg-white">
          <Image
            src={getImageSrc(image)}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-cover hover:scale-105 transition-transform ${isUnavailable ? 'opacity-60 grayscale' : ''}`}
          />
          {isComingSoon && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center gap-0.5 md:gap-1 p-2">
              <span className="bg-blue-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-sm font-bold text-center">
                {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
              </span>
              <span className="text-white text-[9px] md:text-xs font-medium text-center">
                {locale === 'ar' ? 'ترقّب إطلاقه قريبًا' : 'Stay tuned'}
              </span>
            </div>
          )}
          {isOutOfStock && !isComingSoon && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center gap-0.5 md:gap-1 p-2">
              <span className="bg-red-500 text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-sm font-bold text-center">
                {locale === 'ar' ? 'غير متوفر الآن' : 'Out of stock'}
              </span>
              <span className="text-white text-[9px] md:text-xs font-medium text-center">
                {locale === 'ar' ? 'ترقّب عودته قريبًا' : 'Coming back soon'}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Name */}
      <h3 className="text-center text-primary font-semibold text-[11px] md:text-[13px] mb-1 md:mb-2 line-clamp-2">{name}</h3>

      {/* Loyalty Points */}
      {!isUnavailable && loyaltyPointsEnabled && loyaltyPointsValue && loyaltyPointsValue > 0 && (
        <p className="text-center text-amber-600 text-[10px] md:text-xs mb-1 md:mb-2">
          ⭐ +{loyaltyPointsValue} {locale === 'ar' ? 'نقطة' : 'pts'}
        </p>
      )}

      {/* Price - Hidden when unavailable */}
      {!isUnavailable && (
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
      )}

      {/* Coming Soon / Out of Stock Message */}
      {isComingSoon && (
        <div className="text-center mb-2 md:mb-3">
          <p className="text-blue-600 font-semibold text-xs md:text-sm">
            {locale === 'ar' ? 'قريباً' : 'Coming Soon'}
          </p>
          <p className="text-gray-500 text-[10px] md:text-xs">
            {locale === 'ar' ? 'ترقّب إطلاقه قريبًا' : 'Stay tuned'}
          </p>
        </div>
      )}
      {isOutOfStock && !isComingSoon && (
        <div className="text-center mb-2 md:mb-3">
          <p className="text-red-600 font-semibold text-xs md:text-sm">
            {locale === 'ar' ? 'غير متوفر الآن' : 'Out of stock'}
          </p>
          <p className="text-gray-500 text-[10px] md:text-xs">
            {locale === 'ar' ? 'ترقّب عودته قريبًا' : 'Coming back soon'}
          </p>
        </div>
      )}

      {/* Shop Now Button */}
      <Link href={`/products/${id}`}>
        <button 
          className={`w-full text-[10px] md:text-sm py-1.5 md:py-2 px-2 md:px-5 rounded-lg transition-colors flex items-center justify-center gap-1 md:gap-2 ${
            isUnavailable 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'btn-primary'
          }`}
          disabled={isUnavailable}
        >
          {t('shopNow')}
          <Image 
            src="/images/Proceed Icon.svg" 
            alt="proceed" 
            width={12} 
            height={12} 
            className={`w-3 h-3 md:w-[14px] md:h-[14px] ${isUnavailable ? 'opacity-50' : ''}`} 
          />
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
