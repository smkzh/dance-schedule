import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LinkButton from "@/components/LinkButton";
import DeletePerformanceButton from "@/components/DeletePerformanceButton";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ circleId: string }>;
}) {
  const { circleId } = await params;

  const { data: performances } = await supabase
    .from("performances")
    .select("id, name")
    .eq("circle_id", circleId)
    .order("name");

  return (
    <main className="flex flex-col items-center min-h-screen gap-8 p-8">
      <div className="w-full max-w-md">
        <Link href={`/c/${circleId}`} className="text-sm text-gray-400 underline">
          ← ホームに戻る
        </Link>
      </div>

      <h1 className="text-2xl font-bold">管理ページ</h1>
      <p className="text-sm text-gray-500 -mt-4">⚠️ スケジュール係以外は編集しないでください</p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <h2 className="font-medium">公演一覧</h2>
        {performances && performances.length > 0 ? (
          performances.map((performance) => (
            <div
              key={performance.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <span className="font-medium">{performance.name}</span>
              <div className="flex gap-2">
                <Link
                  href={`/c/${circleId}/admin/${performance.id}`}
                  className="h-9 px-4 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors flex items-center"
                >
                  編集
                </Link>
                <DeletePerformanceButton
                  performanceId={performance.id}
                  performanceName={performance.name}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">公演が登録されていません</p>
        )}
      </div>

      <div className="w-full max-w-md">
        <LinkButton href={`/c/${circleId}/admin/upload`} variant="primary">
          新しい公演をCSVで登録
        </LinkButton>
      </div>
    </main>
  );
}
