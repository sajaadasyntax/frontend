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
  loyaltyPointsValue
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
    <div className="product-card relative">
      {/* Badges */}
      {isSale && (
        <div className="badge badge-sale">
          <svg width="28" height="36" viewBox="0 0 28 36" className="absolute inset-0">
            <path d="M0 0 L28 0 L28 28 L14 36 L0 28 Z" fill="currentColor" />
          </svg>
          <span className="relative z-10 text-[10px]">{discount ? `-${discount}%` : '-'}</span>
        </div>
      )}
      {isNew && (
        <div className="badge badge-new">
          <svg width="28" height="36" viewBox="0 0 28 36" className="absolute inset-0">
            <path d="M0 0 L28 0 L28 28 L14 36 L0 28 Z" fill="currentColor" />
          </svg>
          <span className="relative z-10">+</span>
        </div>
      )}

      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="flex justify-center items-center h-44 mb-3 cursor-pointer">
          <Image
            src={getImageSrc(image)}
            alt={name}
            width={100}
            height={150}
            className="object-contain hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      {/* Product Name */}
      <h3 className="text-center text-primary font-semibold text-[13px] mb-2">{name}</h3>

      {/* Loyalty Points */}
      {loyaltyPointsEnabled && loyaltyPointsValue && loyaltyPointsValue > 0 && (
        <p className="text-center text-amber-600 text-xs mb-2">
          ⭐ +{loyaltyPointsValue} {locale === 'ar' ? 'نقطة' : 'points'}
        </p>
      )}

      {/* Price */}
      <p className="text-center text-gray-600 text-sm mb-3">
        {tc('currency')} {displayPrice.toLocaleString()} {tc('perPack')}
      </p>

      {/* Shop Now Button */}
      <Link href={`/products/${id}`}>
        <button className="btn-primary w-full">
          {t('shopNow')}
          <Image src="/images/Proceed Icon.svg" alt="proceed" width={14} height={14} />
        </button>
      </Link>
    </div>
  )
}
