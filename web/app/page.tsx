import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">ダンススケジュール</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/submit"
          className="flex items-center justify-center h-12 rounded-lg bg-black text-white font-medium"
        >
          日程を提出する
        </Link>
        <Link
          href="/numbers"
          className="flex items-center justify-center h-12 rounded-lg border border-black font-medium"
        >
          候補日を確認する
        </Link>
      </div>
    </main>
  );
}
