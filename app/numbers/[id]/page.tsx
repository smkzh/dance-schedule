import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calculateCandidates } from "@/lib/calculateCandidates";

export default async function NumberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ナンバー情報と出演者を取得
  const { data: number } = await supabase
    .from("numbers")
    .select(`
      id, name,
      number_members(
        is_choreographer,
        members(id, name)
      )
    `)
    .eq("id", id)
    .single();

  if (!number) {
    return <p className="p-8 text-gray-500">ナンバーが見つかりません</p>;
  }

  const memberIds = number.number_members.map((nm: any) => nm.members.id);

  // 出演者全員の空き日程を取得
  const { data: availabilities } = await supabase
    .from("availabilities")
    .select("member_id, available_date, time_slot")
    .in("member_id", memberIds);

  const candidates = calculateCandidates(
    availabilities ?? [],
    number.number_members as any
  );

  const choreographers = number.number_members
    .filter((nm: any) => nm.is_choreographer)
    .map((nm: any) => nm.members.name);

  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <div className="w-full max-w-md">
        <Link href="/numbers" className="text-sm text-gray-400 underline">
          ← ナンバー一覧に戻る
        </Link>
      </div>

      <div className="w-full max-w-md flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{number.name}</h1>
        <p className="text-sm text-gray-500">振付: {choreographers.join("・")}</p>
        <p className="text-sm text-gray-500">出演: {number.number_members.length}名</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-md">
        <h2 className="font-medium">練習候補日（欠席数の少ない順）</h2>
        {candidates.length > 0 ? (
          candidates.map((c) => (
            <div
              key={c.date}
              className="flex flex-col gap-1 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.date}</span>
                <span
                  className={`text-sm font-medium ${
                    c.minAbsences === 0 ? "text-green-600" : "text-orange-500"
                  }`}
                >
                  欠席 {c.minAbsences}名
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {c.rangeStart} 〜 {c.rangeEnd}
              </span>
              {c.absentNames.length > 0 && (
                <span className="text-sm text-gray-400">
                  欠席: {c.absentNames.join("・")}
                </span>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            候補日がありません（出演者の日程提出が必要です）
          </p>
        )}
      </div>
    </main>
  );
}
