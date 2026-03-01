'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useLocaleStore } from '@/store/locale-store'
import { bankAccountsApi, settingsApi, UPLOADS_URL } from '@/lib/api'

interface BankAccount {
  id: string
  bankNameEn: string
  bankNameAr: string
  accountName: string
  accountNumber: string
  branchEn: string
  branchAr: string
  image: string
}

interface SiteSettings {
  supportPhone?: string
  supportEmail?: string
  supportWhatsapp?: string
  supportAddressEn?: string
  supportAddressAr?: string
  workingHoursEn?: string
  workingHoursAr?: string
}

export default function SupportPage() {
  const t = useTranslations('support')
  const tc = useTranslations('common')
  const { locale } = useLocaleStore()

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      bankAccountsApi.getAll(),
      settingsApi.get().catch(() => ({}))
    ])
      .then(([banks, settings]) => {
        setBankAccounts(banks)
        setSiteSettings(settings || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const isArabic = locale === 'ar'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{tc('loading')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-primary text-center mb-8">{t('title')}</h1>

        {/* Technical Support */}
        <section className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('technicalSupport')}</h2>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 mb-4">
              {isArabic 
                ? 'للتواصل معنا، يرجى الاتصال على الرقم التالي أو إرسال بريد إلكتروني.'
                : 'To contact us, please call the following number or send an email.'
              }
            </p>
            <div className="flex flex-wrap gap-4">
              {(siteSettings.supportPhone) && (
                <a 
                  href={`tel:${siteSettings.supportPhone}`} 
                  className="flex items-center gap-2 text-secondary hover:underline"
                >
                  📞 {siteSettings.supportPhone}
                </a>
              )}
              {(siteSettings.supportEmail) && (
                <a 
                  href={`mailto:${siteSettings.supportEmail}`} 
                  className="flex items-center gap-2 text-secondary hover:underline"
                >
                  ✉️ {siteSettings.supportEmail}
                </a>
              )}
              {siteSettings.supportWhatsapp && (
                <a 
                  href={`https://wa.me/${siteSettings.supportWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-600 hover:underline"
                >
                  📱 WhatsApp
                </a>
              )}
            </div>
            {(siteSettings.supportAddressEn || siteSettings.supportAddressAr) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-700">
                  📍 {isArabic ? siteSettings.supportAddressAr : siteSettings.supportAddressEn}
                </p>
              </div>
            )}
            {(siteSettings.workingHoursEn || siteSettings.workingHoursAr) && (
              <div className="mt-2">
                <p className="text-gray-600 text-sm">
                  🕐 {isArabic ? siteSettings.workingHoursAr : siteSettings.workingHoursEn}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Bank Accounts */}
        <section className="card">
          <h2 className="text-2xl font-bold text-primary mb-6">{t('bankAccounts')}</h2>
          
          {bankAccounts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {bankAccounts.map((bank) => {
                const bankImageSrc = bank.image
                  ? (bank.image.startsWith('/uploads') ? `${UPLOADS_URL}${bank.image}` : bank.image)
                  : null
                return (
                <div key={bank.id} className="bg-gray-50 rounded-lg overflow-hidden">
                  {bankImageSrc && (
                    <div className="w-full bg-white flex items-center justify-center p-2 md:p-4">
                      <Image
                        src={bankImageSrc}
                        alt={isArabic ? bank.bankNameAr : bank.bankNameEn}
                        width={400}
                        height={250}
                        className="w-full h-auto object-contain"
                        unoptimized={bankImageSrc.startsWith('http')}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-primary mb-2">
                      {isArabic ? bank.bankNameAr : bank.bankNameEn}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="font-semibold">{isArabic ? 'اسم الحساب:' : 'Account Name:'}</span> {bank.accountName}</p>
                      <p><span className="font-semibold">{isArabic ? 'رقم الحساب:' : 'Account Number:'}</span> {bank.accountNumber}</p>
                      {bank.branchEn && (
                        <p><span className="font-semibold">{isArabic ? 'الفرع:' : 'Branch:'}</span> {isArabic ? bank.branchAr : bank.branchEn}</p>
                      )}
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="max-w-md">
                <Image
                  src="/images/bank-card.png"
                  alt="Bank Card"
                  width={400}
                  height={250}
                  className="w-full h-auto rounded-lg shadow-lg mb-4"
                />
                <div className="text-center text-gray-700">
                  <p className="font-semibold">{isArabic ? 'بنكك' : 'Bankak'}</p>
                  <p>{isArabic ? 'رقم الحساب:' : 'Account:'} 1297014</p>
                  <p>{isArabic ? 'فرع الجمهورية' : 'Al-Jumhuriya Branch'}</p>
                  <p>{isArabic ? 'حسام محمد الأمين قاسم' : 'Hussam Mohamed Alamin Qasim'}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
