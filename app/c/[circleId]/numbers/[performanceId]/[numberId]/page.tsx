import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calculateSlotAbsences } from "@/lib/calculateSlotAbsences";
import GanttChart from "@/components/GanttChart";

export const dynamic = "force-dynamic";

export default async function NumberDetailPage({
  params,
}: {
  params: Promise<{ circleId: string; performanceId: string; numberId: string }>;
}) {
  const { circleId, performanceId, numberId } = await params;

  const { data: number } = await supabase
    .from("numbers")
    .select(`
      id, name,
      number_members(
        is_choreographer,
        members(id, name)
      )
    `)
    .eq("id", numberId)
    .single();

  if (!number) {
    return <p className="p-8 text-gray-500">ナンバーが見つかりません</p>;
  }

  const memberIds = number.number_members.map((nm: any) => nm.members.id);

  const { data: availabilities } = await supabase
    .from("availabilities")
    .select("member_id, available_date, time_slot")
    .in("member_id", memberIds);

  const dateSlots = calculateSlotAbsences(
    availabilities ?? [],
    number.number_members as any
  );

  const choreographers = number.number_members
    .filter((nm: any) => nm.is_choreographer)
    .map((nm: any) => nm.members.name);

  const nonChoreographerCount = number.number_members.filter(
    (nm: any) => !nm.is_choreographer
  ).length;

  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <div className="w-full max-w-4xl">
        <Link
          href={`/c/${circleId}/numbers/${performanceId}`}
          className="text-sm text-gray-400 underline"
        >
          ← ナンバー一覧に戻る
        </Link>
      </div>

      <div className="w-full max-w-4xl flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{number.name}</h1>
          <p className="text-sm text-gray-500">振付: {choreographers.join("・")}</p>
          <p className="text-sm text-gray-500">出演: {number.number_members.length}名</p>
        </div>
        <div className="inline-flex flex-col gap-1 text-xs text-gray-500 mt-10">
          <div className="flex items-center gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <span
                key={ratio}
                className="inline-block w-4 h-4 rounded-sm"
                style={{ backgroundColor: `hsl(0, 0%, ${Math.round(20 + ratio * 70)}%)` }}
              />
            ))}
          </div>
          <div className="flex justify-between w-24">
            <span>欠席0</span>
            <span>欠席多</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl">
        <GanttChart
          dateSlots={dateSlots}
          totalMembers={nonChoreographerCount}
        />
      </div>
    </main>
  );
}
