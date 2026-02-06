'use client';

import { Link } from '@/i18n/navigation';
import HankoIcon from '@/components/HankoIcon';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
                ログイン
              </Link>
              <Link
                href="/register"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">会社概要</h1>

          <div className="border border-gray-200 rounded-lg bg-white p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">HankoSign Digitalについて</h2>
            <p className="text-gray-700 leading-relaxed">
              HankoSign Digitalは、日本の伝統的な判子文化とデジタルワークフローを融合した、
              次世代の電子署名システムです。企業のデジタルトランスフォーメーション（DX）を
              支援し、業務効率化とペーパーレス化を実現します。
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">ミッション</h2>
            <p className="text-gray-700 leading-relaxed">
              日本のビジネス文化を尊重しながら、デジタル技術によって
              より効率的で持続可能な社会を実現することを目指しています。
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">お問い合わせ</h2>
            <p className="text-gray-700 mb-4">
              ご質問やご相談がございましたら、お気軽にお問い合わせください。
            </p>
            <div className="flex justify-end">
              <Link
                href="/contact"
                className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
