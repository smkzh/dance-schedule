import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LinkButton from "@/components/LinkButton";

export const dynamic = "force-dynamic";

export default async function CircleHomePage({
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
      <h1 className="text-2xl font-bold">公演一覧</h1>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        {performances && performances.length > 0 ? (
          performances.map((performance) => (
            <div key={performance.id} className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg">
              <p className="font-medium text-lg">{performance.name}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <LinkButton href={`/c/${circleId}/submit/${performance.id}`} variant="primary">
                  日程を提出する
                </LinkButton>
                <LinkButton href={`/c/${circleId}/numbers/${performance.id}`} variant="secondary">
                  候補日を確認する
                </LinkButton>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">公演が登録されていません</p>
        )}
      </div>

      <div className="w-full max-w-sm border-t border-gray-200 pt-6 flex flex-col gap-3">
        <p className="text-sm text-gray-500">⚠️ 管理ページ（スケジュール係以外は編集しないでください）</p>
        <LinkButton href={`/c/${circleId}/admin`} variant="secondary">
          管理ページへ
        </LinkButton>
      </div>
    </main>
  );
}
