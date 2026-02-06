'use client';

import { PlayCircle } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import { Link } from '@/i18n/navigation';

export default function DemoPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">デモ</h1>
          <p className="text-lg text-center mb-12 text-gray-500">
            HankoSign Digitalの機能をご覧ください
          </p>

          <div className="border border-gray-200 rounded-lg bg-white p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">動画デモ</h2>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <PlayCircle className="h-12 w-12 text-hanko-red" />
            </div>
            <p className="mt-4 text-center text-gray-500">
              デモ動画は準備中です
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">印鑑作成</h3>
              <p className="text-sm text-gray-600">デジタル印鑑を簡単に作成できます</p>
            </div>
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">書類署名</h3>
              <p className="text-sm text-gray-600">PDFに直接印鑑を押せます</p>
            </div>
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">承認フロー</h3>
              <p className="text-sm text-gray-600">ワークフローで効率的に管理</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
            >
              今すぐ無料で始める
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
