'use client'

import { useState, useEffect } from 'react'
import { useLocaleStore } from '@/store/locale-store'
import { useAuthStore } from '@/store/auth-store'
import { categoriesApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface Category {
  id: string
  nameEn: string
  nameAr: string
  description: string | null
  parentId: string | null
  parent?: Category | null
  children?: Category[]
  _count?: {
    products: number
    children: number
  }
}

export default function CategoriesPage() {
  const { locale } = useLocaleStore()
  const { token } = useAuthStore()
  const isArabic = locale === 'ar'

  const [categories, setCategories] = useState<Category[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAr: '',
    description: '',
    parentId: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const [hierarchical, flat] = await Promise.all([
        categoriesApi.getAll(),
        categoriesApi.getAll(true)
      ])
      setCategories(hierarchical)
      setAllCategories(flat)
    } catch {
      toast.error(isArabic ? 'خطأ في تحميل الفئات' : 'Error loading categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData, token)
        toast.success(isArabic ? 'تم تحديث الفئة بنجاح' : 'Category updated successfully')
      } else {
        await categoriesApi.create(formData, token)
        toast.success(isArabic ? 'تم إضافة الفئة بنجاح' : 'Category added successfully')
      }
      closeForm()
      fetchCategories()
    } catch {
      toast.error(isArabic ? 'خطأ في حفظ الفئة' : 'Error saving category')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      description: category.description || '',
      parentId: category.parentId || ''
    })
    setShowForm(true)
  }

  const handleAddSubcategory = (parentCategory: Category) => {
    setEditingCategory(null)
    setFormData({
      nameEn: '',
      nameAr: '',
      description: '',
      parentId: parentCategory.id
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    
    const confirmMessage = isArabic 
      ? 'هل أنت متأكد من حذف هذه الفئة؟ سيتم حذف جميع الفئات الفرعية والمنتجات المرتبطة بها.'
      : 'Are you sure you want to delete this category? All subcategories and products will be affected.'
    
    if (!confirm(confirmMessage)) return

    try {
      await categoriesApi.delete(id, token)
      toast.success(isArabic ? 'تم حذف الفئة بنجاح' : 'Category deleted successfully')
      fetchCategories()
    } catch {
      toast.error(isArabic ? 'خطأ في حذف الفئة. قد تحتوي على فئات فرعية أو منتجات.' : 'Error deleting category. It may contain subcategories or products.')
    }
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({ nameEn: '', nameAr: '', description: '', parentId: '' })
  }

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const getParentOptions = () => {
    // Filter out the current category and its children (to prevent circular references)
    const getChildIds = (cat: Category): string[] => {
      const ids = [cat.id]
      if (cat.children) {
        cat.children.forEach(child => {
          ids.push(...getChildIds(child))
        })
      }
      return ids
    }

    const excludeIds = editingCategory ? getChildIds(editingCategory) : []
    return allCategories.filter(cat => !excludeIds.includes(cat.id))
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const indent = level * 24

    return (
      <div key={category.id}>
        <div 
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 hover:shadow-md transition-shadow ${level > 0 ? 'border-l-4 border-l-primary' : ''}`}
          style={{ marginLeft: level > 0 ? (indent > 24 ? 12 : indent) : 0 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-3">
            <div className="flex items-start gap-2 md:gap-3 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="mt-1 text-gray-500 hover:text-primary transition-colors text-sm md:text-base"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              {!hasChildren && level > 0 && (
                <span className="mt-1 text-gray-300 hidden md:inline">└</span>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-bold text-primary">
                  {isArabic ? category.nameAr : category.nameEn}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {isArabic ? category.nameEn : category.nameAr}
                </p>
                {category.parent && (
                  <p className="text-xs text-gray-400 mt-1">
                    {isArabic ? 'الفئة الأب: ' : 'Parent: '}
                    {isArabic ? category.parent.nameAr : category.parent.nameEn}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {hasChildren && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {category._count?.children || 0} {isArabic ? 'فئة فرعية' : 'sub'}
                </span>
              )}
              <span className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {category._count?.products || 0} {isArabic ? 'منتج' : 'prod'}
              </span>
            </div>
          </div>

          {category.description && (
            <p className="text-gray-600 text-xs md:text-sm mt-2 md:mt-3 line-clamp-2">
              {category.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-3 md:mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => handleAddSubcategory(category)}
              className="px-2 md:px-3 py-1 md:py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium"
            >
              ➕ {isArabic ? 'فئة فرعية' : 'Subcategory'}
            </button>
            <button
              onClick={() => handleEdit(category)}
              className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
            >
              ✏️ {isArabic ? 'تعديل' : 'Edit'}
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="px-2 md:px-3 py-1 md:py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
            >
              🗑️ {isArabic ? 'حذف' : 'Delete'}
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {isArabic ? 'إدارة الفئات' : 'Categories Management'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isArabic ? 'إدارة الفئات والفئات الفرعية' : 'Manage categories and subcategories'}
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ nameEn: '', nameAr: '', description: '', parentId: '' })
            setEditingCategory(null)
            setShowForm(true)
          }}
          className="btn-primary"
        >
          ➕ {isArabic ? 'إضافة فئة' : 'Add Category'}
        </button>
      </div>

      {/* Add/Edit Category Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-primary mb-4">
              {editingCategory 
                ? (isArabic ? 'تعديل الفئة' : 'Edit Category')
                : formData.parentId 
                  ? (isArabic ? 'إضافة فئة فرعية' : 'Add Subcategory')
                  : (isArabic ? 'إضافة فئة جديدة' : 'Add New Category')
              }
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الفئة الأب (اختياري)' : 'Parent Category (Optional)'}
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="input-field"
                >
                  <option value="">{isArabic ? 'لا يوجد (فئة رئيسية)' : 'None (Root Category)'}</option>
                  {getParentOptions().map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent ? '└ ' : ''}{isArabic ? cat.nameAr : cat.nameEn}
                      {cat.parent && ` (${isArabic ? cat.parent.nameAr : cat.parent.nameEn})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الاسم بالإنجليزية' : 'Name (English)'}
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="input-field"
                  placeholder="Whitening Agent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الاسم بالعربية' : 'Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="input-field"
                  placeholder="مستحضرات التفتيح"
                  required
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isArabic ? 'الوصف (اختياري)' : 'Description (Optional)'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder={isArabic ? 'وصف الفئة...' : 'Category description...'}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-outline flex-1"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingCategory 
                    ? (isArabic ? 'تحديث' : 'Update')
                    : (isArabic ? 'إضافة' : 'Add')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <p className="text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <div className="space-y-3">
          {categories.map(category => renderCategory(category))}

          {categories.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-lg mb-4">
                {isArabic ? 'لا توجد فئات' : 'No categories found'}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                ➕ {isArabic ? 'إضافة أول فئة' : 'Add First Category'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
