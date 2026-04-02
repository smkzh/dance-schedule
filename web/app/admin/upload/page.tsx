import Link from "next/link";

export default function AdminUploadPage() {
  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">CSVアップロード</h1>
      <p className="text-gray-500">（CSVアップロードフォームをここに作る）</p>
      <Link href="/" className="text-sm text-gray-400 underline">
        ← ホームに戻る
      </Link>
    </main>
  );
}
