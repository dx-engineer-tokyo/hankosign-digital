'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, HelpCircle, Mail, Settings, Users } from 'lucide-react';
import HankoIcon from '@/components/HankoIcon';
import { Link } from '@/i18n/navigation';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: { category: string; icon: any; items: FAQItem[] }[] = [
  {
    category: '印鑑について',
    icon: HankoIcon,
    items: [
      {
        question: '印鑑を作成するにはどうすればいいですか？',
        answer: 'ダッシュボードから「印鑑を作成」をクリックし、印鑑の種類（認印、銀行印、実印）を選択してください。その後、名前と希望する書体を入力すれば、デジタル印鑑が作成されます。',
      },
      {
        question: '認印、銀行印、実印の違いは何ですか？',
        answer: '認印は日常的な書類に使用する印鑑です。銀行印は金融機関での取引に使用します。実印は法的に最も重要な印鑑で、不動産取引や重要契約に使用され、市区町村への登録が必要です。',
      },
      {
        question: '実印の登録はどうすればいいですか？',
        answer: '実印として作成した印鑑は、印鑑情報に登録番号を記録できます。実際の市区町村での登録手続きは別途必要です。',
      },
    ],
  },
  {
    category: '書類管理',
    icon: FileText,
    items: [
      {
        question: '書類をアップロードするにはどうすればいいですか？',
        answer: 'ダッシュボードから「新規書類」をクリックし、PDF形式の書類をアップロードしてください。対応しているファイル形式はPDFのみです。',
      },
      {
        question: '書類に印鑑を押すにはどうすればいいですか？',
        answer: '書類の詳細ページを開き、「印鑑を押す」ボタンをクリックしてください。使用する印鑑を選択し、書類上の押印位置をクリックすると印鑑が配置されます。',
      },
      {
        question: '承認ワークフローを設定できますか？',
        answer: 'はい、書類作成時に承認ワークフローを設定できます。承認者の順序や期限を指定することで、組織内の稟議プロセスをデジタル化できます。',
      },
    ],
  },
  {
    category: 'ワークフロー',
    icon: Users,
    items: [
      {
        question: '承認依頼を送信するにはどうすればいいですか？',
        answer: '書類作成時に「承認フロー」を選択し、承認者を追加してください。承認者には自動的にメール通知が送信されます。',
      },
      {
        question: '承認を代理で行うことはできますか？',
        answer: 'はい、代理承認機能があります。承認者が不在の場合、代理承認者を指定することができます。',
      },
      {
        question: '承認期限を設定できますか？',
        answer: 'はい、各承認ステップに期限を設定できます。期限が近づくと、自動的にリマインダーメールが送信されます。',
      },
    ],
  },
  {
    category: 'アカウント設定',
    icon: Settings,
    items: [
      {
        question: 'プロフィール情報を変更するにはどうすればいいですか？',
        answer: '設定ページの「プロフィール」タブから、氏名、メールアドレス、部署、役職などの情報を変更できます。',
      },
      {
        question: 'パスワードを変更するにはどうすればいいですか？',
        answer: '設定ページの「パスワード」タブから、現在のパスワードと新しいパスワードを入力して変更できます。',
      },
      {
        question: '通知設定を変更できますか？',
        answer: 'はい、設定ページの「通知」タブから、メール通知の受信設定を管理できます。',
      },
    ],
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <HelpCircle className="text-hanko-red mx-auto mb-4 h-12 w-12" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">ヘルプセンター</h1>
          <p className="text-lg text-gray-500">
            HankoSign Digitalの使い方についてよくある質問にお答えします
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックスタート</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/hankos/create"
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium flex items-center gap-3"
            >
              <HankoIcon className="text-hanko-red" size={20} />
              <span>印鑑を作成する</span>
            </Link>
            <Link
              href="/dashboard/documents/new"
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium flex items-center gap-3"
            >
              <FileText className="h-5 w-5 text-hanko-red" />
              <span>書類をアップロードする</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium flex items-center gap-3"
            >
              <Settings className="h-5 w-5 text-hanko-red" />
              <span>設定を変更する</span>
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium flex items-center gap-3"
            >
              <Users className="h-5 w-5 text-hanko-red" />
              <span>ダッシュボードに戻る</span>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {faqData.map((section, sectionIdx) => (
            <div key={sectionIdx} className="border border-gray-200 rounded-lg bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <section.icon className="text-hanko-red h-5 w-5" />
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => {
                  const key = `${sectionIdx}-${itemIdx}`;
                  const isOpen = openItems[key];

                  return (
                    <div key={key} className="border border-gray-200 rounded-lg bg-white">
                      <button
                        type="button"
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <span className="text-sm font-medium text-gray-900">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-200 p-4 text-sm text-gray-700">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-6 mt-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">さらにサポートが必要ですか？</h2>
          <p className="text-gray-600 mb-4">
            上記で解決できない問題がある場合は、サポートチームにお問い合わせください。
          </p>
          <a
            href="mailto:support@hankosign.jp"
            className="bg-hanko-red text-white hover:bg-hanko-ink border border-hanko-red rounded-md px-4 py-2 text-sm font-medium inline-flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            サポートに問い合わせる
          </a>
        </div>

        <div className="text-center mt-8">
          <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
