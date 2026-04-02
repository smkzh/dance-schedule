import Link from "next/link";

export default function SubmitPage() {
  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">日程を提出する</h1>
      <p className="text-gray-500">（日程提出フォームをここに作る）</p>
      <Link href="/" className="text-sm text-gray-400 underline">
        ← ホームに戻る
      </Link>
    </main>
  );
}
