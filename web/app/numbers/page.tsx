import Link from "next/link";

export default function NumbersPage() {
  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">ナンバー一覧</h1>
      <p className="text-gray-500">（ナンバーの一覧をここに表示する）</p>
      <Link href="/" className="text-sm text-gray-400 underline">
        ← ホームに戻る
      </Link>
    </main>
  );
}
