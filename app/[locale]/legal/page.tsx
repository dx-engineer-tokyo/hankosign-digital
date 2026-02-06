'use client';

import HankoIcon from '@/components/HankoIcon';
import { Link } from '@/i18n/navigation';

export default function LegalPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">利用規約</h1>

          <div className="border border-gray-200 rounded-lg bg-white p-6 mb-6 text-gray-700 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">第1条（適用）</h2>
            <p>
              本規約は、HankoSign Digital（以下「当社」）が提供するサービス（以下「本サービス」）の
              利用条件を定めるものです。ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
            </p>

            <h2 className="text-lg font-semibold text-gray-900">第2条（利用登録）</h2>
            <p>
              本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって
              利用登録を申請し、当社がこれを承認することで、利用登録が完了します。
            </p>

            <h2 className="text-lg font-semibold text-gray-900">第3条（禁止事項）</h2>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社、本サービスの他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
              <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900">第4条（本サービスの提供の停止等）</h2>
            <p>
              当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
              本サービスの全部または一部の提供を停止または中断することができます。
            </p>

            <h2 className="text-lg font-semibold text-gray-900">第5条（免責事項）</h2>
            <p>
              当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた
              取引、連絡または紛争等について一切責任を負いません。
            </p>

            <h2 className="text-lg font-semibold text-gray-900">第6条（準拠法・裁判管轄）</h2>
            <p>
              本規約の解釈にあたっては、日本法を準拠法とします。
              本サービスに関して紛争が生じた場合には、東京地方裁判所を専属的合意管轄とします。
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
