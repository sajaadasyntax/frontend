'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { recipesApi, UPLOADS_URL } from '@/lib/api'
import Image from 'next/image'
import Link from 'next/link'

interface Recipe {
  id: string
  recipeNameEn: string
  recipeNameAr: string
  descriptionEn?: string
  descriptionAr?: string
  imageUrl?: string
}

interface Product {
  id: string
  nameEn: string
  nameAr: string
  image?: string
  descriptionEn?: string
  descriptionAr?: string
}

export default function ProductRecipesPage({ params }: { params: { productId: string } }) {
  const { locale } = useLocaleStore()
  const isArabic = locale === 'ar'

  const [product, setProduct] = useState<Product | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipes()
  }, [params.productId])

  const fetchRecipes = async () => {
    try {
      const data = await recipesApi.getByProductId(params.productId)
      setProduct(data.product)
      setRecipes(data.recipes)
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageSrc = (img?: string) => {
    if (!img) return '/images/product-tube.png'
    if (img.startsWith('/uploads')) return `${UPLOADS_URL}${img}`
    return img
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            {isArabic ? 'المنتج غير موجود' : 'Product not found'}
          </h1>
          <Link href="/" className="text-primary hover:underline">
            {isArabic ? 'العودة للرئيسية' : 'Back to home'}
          </Link>
        </div>
      </div>
    )
  }

  const productName = isArabic ? product.nameAr : product.nameEn

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link 
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
        >
          ← {isArabic ? 'العودة للمنتج' : 'Back to product'}
        </Link>

        {/* Product Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-32 h-32 relative flex-shrink-0">
              <Image
                src={getImageSrc(product.image)}
                alt={productName}
                fill
                className="object-contain"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {isArabic ? 'وصفات باستخدام' : 'Recipes using'} {productName}
              </h1>
              <p className="text-gray-600">
                {isArabic 
                  ? `اكتشف ما يمكنك صنعه باستخدام ${productName}`
                  : `Discover what you can make using ${productName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {recipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              {isArabic ? 'لا توجد وصفات لهذا المنتج حالياً' : 'No recipes available for this product yet'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {recipe.imageUrl && (
                  <div className="relative h-48">
                    <Image
                      src={getImageSrc(recipe.imageUrl)}
                      alt={isArabic ? recipe.recipeNameAr : recipe.recipeNameEn}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-primary mb-3">
                    {isArabic ? recipe.recipeNameAr : recipe.recipeNameEn}
                  </h2>
                  {(recipe.descriptionEn || recipe.descriptionAr) && (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {isArabic ? recipe.descriptionAr : recipe.descriptionEn}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA to buy product */}
        <div className="mt-8 text-center">
          <Link href={`/products/${product.id}`}>
            <button className="btn-primary px-8 py-3">
              {isArabic ? `شراء ${productName}` : `Buy ${productName}`}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

