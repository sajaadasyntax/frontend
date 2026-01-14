'use client'

import { useLocaleStore } from '@/store/locale-store'

export default function AboutPage() {
  const { locale } = useLocaleStore()
  const isArabic = locale === 'ar'

  return (
    <div className="page-container py-6 md:py-10">
      {/* Hero Section */}
      <section className="mb-8 md:mb-12">
        <h1 className="section-title text-2xl md:text-4xl mb-4 md:mb-6">
          {isArabic ? 'حولنا' : 'About Us'}
        </h1>
      </section>

      {/* About Company Section */}
      <section className="mb-8 md:mb-12 bg-gray-50 rounded-xl p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
          {isArabic ? '1. نبذة عن الشركة' : '1. About the Company'}
        </h2>
        <div className="text-gray-700 text-sm md:text-base leading-relaxed space-y-4">
          {isArabic ? (
            <>
              <p>
                شركة <span className="font-semibold text-primary">مايان للإمدادات الكوزموصيدلانية</span> هي شركة متخصصة في إنتاج وتطوير مستحضرات التجميل والعناية بالبشرة والشعر، تعتمد على أحدث التقنيات العالمية وأفضل المواد الخام لضمان منتجات آمنة وفعّالة.
              </p>
              <p>
                نلتزم بتقديم حلول تجميلية عالية الجودة تناسب احتياجات المرأة الحديثة وتلبي معايير السلامة العالمية.
              </p>
            </>
          ) : (
            <>
              <p>
                <span className="font-semibold text-primary">Mayan for Cosmeceutical Supplies</span> is a company specialized in the production and development of cosmetics, skincare, and hair care products. We rely on the latest global technologies and the finest raw materials to ensure safe and effective products.
              </p>
              <p>
                We are committed to providing high-quality cosmetic solutions that meet the needs of modern women and comply with global safety standards.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Vision Section */}
      <section className="mb-8 md:mb-12 bg-white rounded-xl p-6 md:p-10 border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
          {isArabic ? '2. رؤيتنا' : '2. Our Vision'}
        </h2>
        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
          {isArabic ? (
            <>
              أن نكون من الشركات الرائدة في مجال مستحضرات التجميل في السودان -و قريباً العالم العربي- ونقدّم منتجات مبتكرة تجمع بين الجمال، الأمان، والنتائج الموثوقة.
            </>
          ) : (
            <>
              To be among the leading companies in the cosmetics industry in Sudan - and soon the Arab world - and provide innovative products that combine beauty, safety, and reliable results.
            </>
          )}
        </p>
      </section>

      {/* Mission Section */}
      <section className="mb-8 md:mb-12 bg-gray-50 rounded-xl p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
          {isArabic ? '3. رسالتنا' : '3. Our Mission'}
        </h2>
        <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
          {isArabic ? (
            <>
              نشر مفهوم العناية الصحية بالبشرة والشعر من خلال تطوير منتجات تعتمد على:
            </>
          ) : (
            <>
              Spreading the concept of healthy skincare and hair care through developing products based on:
            </>
          )}
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm md:text-base ml-4 md:ml-6">
          {isArabic ? (
            <>
              <li>جودة عالية</li>
              <li>خامات معتمدة</li>
              <li>أسعار تنافسية</li>
              <li>تركيز على كل احتياجات العميل</li>
            </>
          ) : (
            <>
              <li>High quality</li>
              <li>Certified raw materials</li>
              <li>Competitive prices</li>
              <li>Focus on all customer needs</li>
            </>
          )}
        </ul>
      </section>

      {/* Core Values Section */}
      <section className="mb-8 md:mb-12 bg-white rounded-xl p-6 md:p-10 border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
          {isArabic ? '4. قيمنا' : '4. Our Core Values'}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {isArabic ? (
            <>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>الجودة أولاً</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>الشفافية والالتزام</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>الابتكار والتطوير المستمر</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>رضا العملاء</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base md:col-span-2">
                <span className="text-secondary font-bold">•</span>
                <span>السلامة قبل كل شيء</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>Quality First</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>Transparency and Commitment</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>Innovation and Continuous Development</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold">•</span>
                <span>Customer Satisfaction</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700 text-sm md:text-base md:col-span-2">
                <span className="text-secondary font-bold">•</span>
                <span>Safety Above All</span>
              </li>
            </>
          )}
        </ul>
      </section>

      {/* Why Choose Us Section */}
      <section className="mb-8 md:mb-12 bg-gray-50 rounded-xl p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
          {isArabic ? '5. لماذا نحن؟' : '5. Why Choose Us?'}
        </h2>
        <ul className="space-y-3 md:space-y-4">
          {isArabic ? (
            <>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>نعتمد على مواد خام صيدلانية عالية الجودة</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>نصنّع وفقًا لمعايير الجودة والممارسات التصنيعية الجيدة (GMP)</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>نوفّر إمكانية تصنيع العلامات الخاصة (Private Label)</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>فريق متخصص في الكيمياء التجميلية</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>دعم فني واستشارات مجانية للعلامات التجارية الناشئة</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>We rely on high-quality pharmaceutical raw materials</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>We manufacture according to quality standards and Good Manufacturing Practices (GMP)</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>We provide private label manufacturing capabilities</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>Specialized team in cosmetic chemistry</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>Free technical support and consultations for emerging brands</span>
              </li>
            </>
          )}
        </ul>
      </section>

      {/* Services Section */}
      <section className="mb-8 md:mb-12 bg-white rounded-xl p-6 md:p-10 border border-gray-200">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
          {isArabic ? '6. خدماتنا' : '6. Our Services'}
        </h2>
        <ul className="space-y-3 md:space-y-4">
          {isArabic ? (
            <>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>تصنيع مستحضرات التجميل</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>تطوير صيغ تجميلية حسب الطلب</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>بيع مواد خام تجميلية وصيدلانية</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>Cosmetic product manufacturing</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>Custom cosmetic formula development</span>
              </li>
              <li className="flex items-start gap-3 text-gray-700 text-sm md:text-base">
                <span className="text-secondary font-bold mt-1">•</span>
                <span>Sale of cosmetic and pharmaceutical raw materials</span>
              </li>
            </>
          )}
        </ul>
      </section>

      {/* CEO Message Section */}
      <section className="mb-8 md:mb-12 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 md:p-10 border-2 border-primary/20">
        <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
          {isArabic ? '7. رسالة المدير العام' : '7. CEO Message'}
        </h2>
        <div className="bg-white/80 rounded-lg p-6 md:p-8 border-l-4 border-secondary">
          <p className="text-gray-700 text-sm md:text-base leading-relaxed italic">
            {isArabic ? (
              <>
                "نحن نؤمن بأن الجمال يبدأ من الجودة… لذلك نعمل على توفير منتجات تجمع بين الفاعلية، الأمان، واللمسة الراقية. هدفنا أن نصبح شريك الجمال الأول لكل امرأة."
              </>
            ) : (
              <>
                "We believe that beauty starts with quality... Therefore, we work to provide products that combine effectiveness, safety, and elegance. Our goal is to become the first beauty partner for every woman."
              </>
            )}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center justify-center my-8 md:my-12">
        <div className="w-24 md:w-32 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
      </div>
    </div>
  )
}

