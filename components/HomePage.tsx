'use client';

import { BadgeCheck, FileCheck, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import HankoIcon from '@/components/HankoIcon';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center text-lg font-semibold text-gray-900">
              <HankoIcon className="mr-2 text-hanko-red" size={20} />
              <span>HankoSign Digital</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
              >
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {t('heroBody').split('\n').map((line: string, index: number) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
              >
                {t('ctaStart')}
              </Link>
              <Link
                href="/demo"
                className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium"
              >
                {t('ctaDemo')}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 border border-gray-200 rounded-lg bg-white divide-y sm:divide-y-0 sm:divide-x">
              <div className="grid sm:grid-cols-3">
                <div className="px-6 py-4">
                  <div className="text-sm text-gray-500">{t('statsCost')}</div>
                  <div className="text-2xl font-semibold text-hanko-red">¥1.2兆</div>
                  <div className="text-sm text-gray-500">{t('statsCostDesc')}</div>
                </div>
                <div className="px-6 py-4">
                  <div className="text-sm text-gray-500">{t('statsEfficiency')}</div>
                  <div className="text-2xl font-semibold text-hanko-red">83%</div>
                  <div className="text-sm text-gray-500">{t('statsEfficiencyDesc')}</div>
                </div>
                <div className="px-6 py-4">
                  <div className="text-sm text-gray-500">{t('statsLegal')}</div>
                  <div className="text-2xl font-semibold text-hanko-red">100%</div>
                  <div className="text-sm text-gray-500">{t('statsLegalDesc')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
          {t('featuresTitle')}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border border-gray-200 rounded-lg bg-white p-6 text-center">
            <HankoIcon className="mx-auto text-hanko-red mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('featureHankoTitle')}</h3>
            <p className="text-sm text-gray-600">{t('featureHankoBody')}</p>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white p-6 text-center">
            <FileCheck className="mx-auto h-10 w-10 text-hanko-red mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('featureWorkflowTitle')}</h3>
            <p className="text-sm text-gray-600">{t('featureWorkflowBody')}</p>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white p-6 text-center">
            <BadgeCheck className="mx-auto h-10 w-10 text-hanko-red mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('featureLegalTitle')}</h3>
            <p className="text-sm text-gray-600">{t('featureLegalBody')}</p>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white p-6 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-hanko-red mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('featureSecurityTitle')}</h3>
            <p className="text-sm text-gray-600">{t('featureSecurityBody')}</p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            {t('useCasesTitle')}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-hanko-red mb-2">{t('useCaseContractTitle')}</h3>
              <p className="text-sm text-gray-600">{t('useCaseContractBody')}</p>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-hanko-red mb-2">{t('useCaseBankTitle')}</h3>
              <p className="text-sm text-gray-600">{t('useCaseBankBody')}</p>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-hanko-red mb-2">{t('useCaseRealEstateTitle')}</h3>
              <p className="text-sm text-gray-600">{t('useCaseRealEstateBody')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-hanko-red text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t('ctaTitle')}</h2>
            <p className="text-lg mb-8">
              {t('ctaBody').split('\n').map((line: string, index: number) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}
            </p>
            <Link
              href="/register"
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium"
            >
              {t('ctaFree')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center space-y-3">
            <HankoIcon className="mx-auto text-hanko-red" size={32} />
            <p className="font-semibold text-gray-900">HankoSign Digital</p>
            <p className="text-sm text-gray-600">{t('footerTagline')}</p>
            <p className="text-sm text-gray-500">{t('footerCompliance')}</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/about" className="text-gray-700 hover:text-gray-900">
                {t('footerCompany')}
              </Link>
              <Link href="/legal" className="text-gray-700 hover:text-gray-900">
                {t('footerLegal')}
              </Link>
              <Link href="/privacy" className="text-gray-700 hover:text-gray-900">
                {t('footerPrivacy')}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900">
                {t('footerContact')}
              </Link>
            </div>
            <p className="text-sm text-gray-500">{t('footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
