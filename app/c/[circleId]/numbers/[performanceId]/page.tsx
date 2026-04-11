import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function NumbersPage({
  params,
}: {
  params: Promise<{ circleId: string; performanceId: string }>;
}) {
  const { circleId, performanceId } = await params;

  const { data: performance } = await supabase
    .from("performances")
    .select("name")
    .eq("id", performanceId)
    .single();

  const { data: numbers } = await supabase
    .from("numbers")
    .select(`
      id,
      name,
      number_members(
        is_choreographer,
        members(name)
      )
    `)
    .eq("performance_id", performanceId)
    .order("name");

  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <div className="w-full max-w-sm">
        <Link href={`/c/${circleId}`} className="text-sm text-gray-400 underline">
          ← ホームに戻る
        </Link>
      </div>
      <h1 className="text-2xl font-bold">ナンバー一覧</h1>
      {performance && (
        <p className="text-gray-500">{performance.name}</p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {numbers && numbers.length > 0 ? (
          numbers.map((number) => {
            const choreographers = number.number_members
              .filter((nm: any) => nm.is_choreographer)
              .map((nm: any) => nm.members.name);

            return (
              <Link
                key={number.id}
                href={`/c/${circleId}/numbers/${performanceId}/${number.id}`}
                className="flex flex-col gap-1 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium">{number.name}</span>
                <span className="text-sm text-gray-500">
                  振付: {choreographers.join("・")}
                </span>
              </Link>
            );
          })
        ) : (
          <p className="text-gray-500">ナンバーが登録されていません</p>
        )}
      </div>
    </main>
  );
}
