'use client';

import { useState } from 'react';
import { Building2, Mail, Send, User } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import { Link } from '@/i18n/navigation';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '送信に失敗しました。もう一度お試しください。');
        return;
      }

      setIsSuccess(true);
    } catch {
      setError('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">お問い合わせ</h1>
          <p className="text-center mb-12 text-gray-500">
            ご質問やご相談がございましたら、お気軽にお問い合わせください
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg bg-white p-6">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                  <Mail className="h-5 w-5 text-hanko-red" />
                  メールでのお問い合わせ
                </div>
                <p className="text-gray-900">support@hankosign.jp</p>
                <p className="text-sm text-gray-500">
                  営業時間: 平日 9:00 - 18:00
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg bg-white p-6">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                  <Building2 className="h-5 w-5 text-hanko-red" />
                  本社所在地
                </div>
                <p className="text-gray-900">〒100-0001<br />東京都千代田区千代田1-1-1</p>
              </div>

              <div className="border border-gray-200 rounded-lg bg-white p-6">
                <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                  <User className="h-5 w-5 text-hanko-red" />
                  よくある質問
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  よくある質問は、ヘルプセンターをご確認ください。
                </p>
                <Link
                  href="/help"
                  className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
                >
                  ヘルプセンター
                </Link>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg bg-white p-6">
              {isSuccess ? (
                <div className="text-center py-8">
                  <Send className="text-hanko-red mx-auto mb-4 h-12 w-12" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">送信完了</h3>
                  <p className="text-gray-700 mb-4">
                    お問い合わせいただきありがとうございます。<br />
                    担当者よりご連絡させていただきます。
                  </p>
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium"
                  >
                    新しいお問い合わせ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">お問い合わせフォーム</h2>

                  {error && (
                    <div className="border border-red-200 bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">お名前 *</label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス *</label>
                    <input
                      type="email"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">件名 *</label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">お問い合わせ内容 *</label>
                    <textarea
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full h-32 focus:border-hanko-red focus:ring-1 focus:ring-hanko-red"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? '送信中...' : '送信する'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
