'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { recipesApi, productsApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Recipe {
  id: string
  productId: string
  recipeNameEn: string
  recipeNameAr: string
  descriptionEn?: string
  descriptionAr?: string
  imageUrl?: string
  isActive: boolean
  product: {
    id: string
    nameEn: string
    nameAr: string
    image?: string
  }
}

interface Product {
  id: string
  nameEn: string
  nameAr: string
}

export default function RecipesPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [formData, setFormData] = useState({
    productId: '',
    recipeNameEn: '',
    recipeNameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    imageUrl: '',
    isActive: true
  })

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token])

  const fetchData = async () => {
    if (!token) return
    try {
      const [recipesData, productsData] = await Promise.all([
        recipesApi.getAll(token),
        productsApi.getAll()
      ])
      setRecipes(recipesData)
      setProducts(productsData)
    } catch (error) {
      toast.error(isArabic ? 'خطأ في تحميل البيانات' : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingRecipe(null)
    setFormData({
      productId: '',
      recipeNameEn: '',
      recipeNameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      imageUrl: '',
      isActive: true
    })
    setShowModal(true)
  }

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      productId: recipe.productId,
      recipeNameEn: recipe.recipeNameEn,
      recipeNameAr: recipe.recipeNameAr,
      descriptionEn: recipe.descriptionEn || '',
      descriptionAr: recipe.descriptionAr || '',
      imageUrl: recipe.imageUrl || '',
      isActive: recipe.isActive
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      if (editingRecipe) {
        await recipesApi.update(editingRecipe.id, formData, token)
        toast.success(isArabic ? 'تم تحديث الوصفة' : 'Recipe updated')
      } else {
        await recipesApi.create(formData, token)
        toast.success(isArabic ? 'تمت إضافة الوصفة' : 'Recipe added')
      }
      setShowModal(false)
      fetchData()
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    if (!confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return

    try {
      await recipesApi.delete(id, token)
      toast.success(isArabic ? 'تم حذف الوصفة' : 'Recipe deleted')
      fetchData()
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
  }

  const toggleActive = async (recipe: Recipe) => {
    if (!token) return
    try {
      await recipesApi.update(recipe.id, { isActive: !recipe.isActive }, token)
      fetchData()
    } catch (error) {
      toast.error(isArabic ? 'حدث خطأ' : 'An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Group recipes by product for easier viewing
  const recipesByProduct = recipes.reduce((acc, recipe) => {
    const productName = isArabic ? recipe.product.nameAr : recipe.product.nameEn
    if (!acc[productName]) {
      acc[productName] = []
    }
    acc[productName].push(recipe)
    return acc
  }, {} as Record<string, Recipe[]>)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {isArabic ? 'إدارة وصفات المنتجات' : 'Product Recipes Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isArabic 
              ? 'أضف وصفات للمنتجات لإظهار ما يمكن صنعه باستخدام كل منتج'
              : 'Add recipes to products to show what can be made using each product'}
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          {isArabic ? '+ إضافة وصفة' : '+ Add Recipe'}
        </button>
      </div>

      {/* Recipes Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold">
                {isArabic ? 'المنتج' : 'Product'}
              </th>
              <th className="text-left p-4 font-semibold">
                {isArabic ? 'اسم الوصفة' : 'Recipe Name'}
              </th>
              <th className="text-left p-4 font-semibold">
                {isArabic ? 'الوصف' : 'Description'}
              </th>
              <th className="text-center p-4 font-semibold">
                {isArabic ? 'الحالة' : 'Status'}
              </th>
              <th className="text-center p-4 font-semibold">
                {isArabic ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <span className="font-medium text-primary">
                    {isArabic ? recipe.product.nameAr : recipe.product.nameEn}
                  </span>
                </td>
                <td className="p-4">
                  {isArabic ? recipe.recipeNameAr : recipe.recipeNameEn}
                </td>
                <td className="p-4 max-w-xs">
                  <p className="truncate text-gray-600 text-sm">
                    {isArabic ? recipe.descriptionAr : recipe.descriptionEn}
                  </p>
                </td>
                <td className="text-center p-4">
                  <button
                    onClick={() => toggleActive(recipe)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      recipe.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {recipe.isActive
                      ? (isArabic ? 'نشط' : 'Active')
                      : (isArabic ? 'غير نشط' : 'Inactive')}
                  </button>
                </td>
                <td className="text-center p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openEditModal(recipe)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {recipes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {isArabic ? 'لا توجد وصفات' : 'No recipes found'}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingRecipe
                ? (isArabic ? 'تعديل الوصفة' : 'Edit Recipe')
                : (isArabic ? 'إضافة وصفة جديدة' : 'Add New Recipe')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'المنتج' : 'Product'} *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">{isArabic ? 'اختر منتج' : 'Select a product'}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {isArabic ? product.nameAr : product.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'اسم الوصفة (إنجليزي)' : 'Recipe Name (English)'} *
                </label>
                <input
                  type="text"
                  value={formData.recipeNameEn}
                  onChange={(e) => setFormData({ ...formData, recipeNameEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Brightening Serum"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'اسم الوصفة (عربي)' : 'Recipe Name (Arabic)'} *
                </label>
                <input
                  type="text"
                  value={formData.recipeNameAr}
                  onChange={(e) => setFormData({ ...formData, recipeNameAr: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  dir="rtl"
                  placeholder="مثال: سيروم التفتيح"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Detailed description or instructions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  dir="rtl"
                  placeholder="الوصف التفصيلي أو التعليمات..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'رابط الصورة' : 'Image URL'}
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="/images/recipe-example.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  {isArabic ? 'نشط (يظهر للمستخدمين)' : 'Active (visible to users)'}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingRecipe
                    ? (isArabic ? 'تحديث' : 'Update')
                    : (isArabic ? 'إضافة' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

