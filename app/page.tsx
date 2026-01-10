'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { useLocaleStore } from '@/store/locale-store'
import { productsApi, categoriesApi } from '@/lib/api'

interface Product {
  id: string
  nameEn: string
  nameAr: string
  price: number
  image: string | null
  isSale: boolean
  isNew: boolean
  discount: number | null
  categoryId: string
  loyaltyPointsEnabled: boolean
  loyaltyPointsValue: number
}

interface Category {
  id: string
  nameEn: string
  nameAr: string
  parentId: string | null
  children?: Category[]
  _count?: {
    products: number
    children: number
  }
}

export default function HomePage() {
  const { locale } = useLocaleStore()
  const isArabic = locale === 'ar'
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      productsApi.getAll(),
      categoriesApi.getAll()
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData)
        setCategories(categoriesData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Get all category IDs including children for filtering
  const getAllCategoryIds = (category: Category): string[] => {
    const ids = [category.id]
    if (category.children) {
      category.children.forEach(child => {
        ids.push(...getAllCategoryIds(child))
      })
    }
    return ids
  }

  // Get products for a category (including all subcategories)
  const getProductsForCategory = (category: Category): Product[] => {
    const allIds = getAllCategoryIds(category)
    return products.filter(p => allIds.includes(p.categoryId))
  }

  // Flatten categories for rendering sections (shows subcategories with their products)
  const renderCategorySection = (category: Category, level: number = 0, bgIndex: number = 0) => {
    const categoryProducts = products.filter(p => p.categoryId === category.id)
    const categoryName = isArabic ? category.nameAr : category.nameEn
    const hasDirectProducts = categoryProducts.length > 0
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id}>
        {/* Show category section if it has direct products */}
        {hasDirectProducts && (
          <section 
            className={`py-14 ${(bgIndex + level) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                {level > 0 && (
                  <span className="text-gray-400 text-sm">└</span>
                )}
                <h2 className={`section-title ${level > 0 ? 'text-xl' : ''}`}>
                  {categoryName.toUpperCase()}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {categoryProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    nameEn={product.nameEn}
                    nameAr={product.nameAr}
                    price={product.price}
                    image={product.image || undefined}
                    isSale={product.isSale}
                    isNew={product.isNew}
                    discount={product.discount || undefined}
                    loyaltyPointsEnabled={product.loyaltyPointsEnabled}
                    loyaltyPointsValue={product.loyaltyPointsValue}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Render parent category header if it only has subcategories */}
        {!hasDirectProducts && hasChildren && (
          <section className={`py-8 ${(bgIndex + level) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto">
              <h2 className="section-title text-primary border-b-2 border-primary pb-2 mb-2">
                {categoryName.toUpperCase()}
              </h2>
            </div>
          </section>
        )}

        {/* Render children */}
        {hasChildren && category.children!.map((child, idx) => 
          renderCategorySection(child, level + 1, bgIndex + idx + 1)
        )}
      </div>
    )
  }

  // Category filter tabs
  const CategoryTabs = () => {
    if (categories.length === 0) return null

    return (
      <div className="bg-white py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isArabic ? 'الكل' : 'All'}
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isArabic ? category.nameAr : category.nameEn}
                {category._count && category._count.children > 0 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({category._count.children})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter categories based on selection
  const filteredCategories = selectedCategory 
    ? categories.filter(c => c.id === selectedCategory)
    : categories

  return (
    <div className="min-h-screen bg-white" style={{ marginLeft: '5%', marginRight: '5%' }}>
      {/* Hero Section */}
      <section 
        className="bg-gradient-to-br from-gray-100 to-gray-200 py-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-5">
              {/* Best Seller Badge */}
              <div className="inline-block">
                <div className="relative w-[110px] h-[110px]">
                  <svg width="110" height="110" viewBox="0 0 110 110" className="text-gold">
                    <circle cx="55" cy="55" r="48" fill="currentColor" opacity="0.15" />
                    <circle cx="55" cy="55" r="38" fill="currentColor" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="flex gap-0.5 mb-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-300 text-[10px]">★</span>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold leading-tight">
                      {isArabic ? 'الأكثر' : 'BEST'}
                    </p>
                    <p className="text-[10px] font-bold leading-tight">
                      {isArabic ? 'مبيعاً' : 'SELLER'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Title and Description */}
              <div>
                <h1 className="text-[32px] font-bold text-primary mb-3">
                  {isArabic ? 'منتجات العناية بالبشرة' : 'Premium Skincare'}
                </h1>
                <p className="text-gray-600 text-[13px] leading-relaxed max-w-md">
                  {isArabic 
                    ? 'اكتشف مجموعتنا من منتجات العناية بالبشرة الفاخرة. منتجات عالية الجودة لبشرة صحية ومشرقة.'
                    : 'Discover our collection of premium skincare products. High-quality products for healthy and radiant skin.'
                  }
                </p>
              </div>

              {/* Order Button */}
              <Link href="#products">
                <button className="btn-primary px-6">
                  {isArabic ? 'تسوق الآن' : 'Order now'}
                  <Image src="/images/Proceed Icon.svg" alt="proceed" width={14} height={14} />
                </button>
              </Link>
            </div>

            {/* Right Content - Product Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-full">
                <Image
                  src="/images/banner.jpg"
                  alt="Product"
                  width={450}
                  height={450}
                  className="object-contain w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <CategoryTabs />

      {/* Product Sections by Category */}
      <div id="products">
        {loading ? (
          <div className="py-14 text-center">
            <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => renderCategorySection(category, 0, index))
        ) : (
          <>
            {/* Default sections if no categories */}
            <section className="py-14 bg-gray-50">
              <div className="max-w-7xl mx-auto">
                <h2 className="section-title">
                  {isArabic ? 'مستحضرات التفتيح' : 'WHITENING AGENT'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {[1,2,3,4].map((i) => (
                    <ProductCard
                      key={i}
                      id={`demo-${i}`}
                      nameEn="Tretinoin"
                      nameAr="تريتينوين"
                      price={500}
                      isSale={true}
                      isNew={true}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="py-14 bg-white">
              <div className="max-w-7xl mx-auto">
                <h2 className="section-title">
                  {isArabic ? 'مستحضرات التقشير' : 'PEELING AGENT'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {[5,6,7,8].map((i) => (
                    <ProductCard
                      key={i}
                      id={`demo-${i}`}
                      nameEn="Alpha Arbutin"
                      nameAr="ألفا أربيوتين"
                      price={500}
                      isSale={true}
                      isNew={true}
                    />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
