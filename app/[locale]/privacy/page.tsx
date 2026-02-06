'use client';

import HankoIcon from '@/components/HankoIcon';
import { Link } from '@/i18n/navigation';

export default function PrivacyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">プライバシーポリシー</h1>

          <div className="border border-gray-200 rounded-lg bg-white p-6 mb-6 text-gray-700 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">個人情報の取り扱いについて</h2>
            <p>
              HankoSign Digital（以下「当社」）は、本サービスにおけるユーザーの個人情報の取扱いについて、
              以下のとおりプライバシーポリシーを定めます。
            </p>

            <h2 className="text-lg font-semibold text-gray-900">第1条（収集する情報）</h2>
            <p>当社は、ユーザーから以下の情報を取得します。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>氏名、メールアドレス、電話番号等の連絡先情報</li>
              <li>会社名、部署名、役職等の所属情報</li>
              <li>本サービスの利用履歴、アクセスログ等の利用情報</li>
              <li>作成された印鑑データおよび署名データ</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900">第2条（利用目的）</h2>
            <p>当社は、取得した個人情報を以下の目的で利用します。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスの提供、運営、維持および改善のため</li>
              <li>ユーザーからのお問い合わせに対応するため</li>
              <li>本サービスに関する情報提供のため</li>
              <li>利用規約違反への対応のため</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900">第3条（第三者提供）</h2>
            <p>
              当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900">第4条（セキュリティ）</h2>
            <p>
              当社は、個人情報への不正アクセス、紛失、破壊、改ざんおよび漏洩等を防止するため、
              必要かつ適切な安全管理措置を講じます。
            </p>

            <h2 className="text-lg font-semibold text-gray-900">第5条（お問い合わせ窓口）</h2>
            <p>
              本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
            </p>
            <p>
              メールアドレス: privacy@hankosign.jp
            </p>

            <p className="text-sm text-right text-gray-500 mt-8">
              最終更新日: 2024年1月1日
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
