import Link from "next/link";

export default async function NumberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">ナンバー詳細</h1>
      <p className="text-gray-500">ナンバーID: {id}</p>
      <p className="text-gray-500">（候補日をここに表示する）</p>
      <Link href="/numbers" className="text-sm text-gray-400 underline">
        ← ナンバー一覧に戻る
      </Link>
    </main>
  );
}
