import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PerformanceEditor from "@/components/PerformanceEditor";

export const dynamic = "force-dynamic";

export default async function PerformanceEditPage({
  params,
}: {
  params: Promise<{ circleId: string; performanceId: string }>;
}) {
  const { circleId, performanceId } = await params;

  const { data: performance } = await supabase
    .from("performances")
    .select("id, name")
    .eq("id", performanceId)
    .single();

  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .eq("performance_id", performanceId)
    .order("name");

  const { data: numbers } = await supabase
    .from("numbers")
    .select(`
      id, name,
      number_members(
        member_id,
        is_choreographer,
        members(id, name)
      )
    `)
    .eq("performance_id", performanceId)
    .order("name");

  if (!performance) {
    return <p className="p-8 text-gray-500">公演が見つかりません</p>;
  }

  return (
    <main className="flex flex-col items-center min-h-screen gap-8 p-8">
      <div className="w-full max-w-lg">
        <Link href={`/c/${circleId}/admin`} className="text-sm text-gray-400 underline">
          ← 管理ページに戻る
        </Link>
      </div>
      <h1 className="text-2xl font-bold">公演編集</h1>
      <PerformanceEditor
        performance={performance}
        members={members ?? []}
        numbers={(numbers ?? []) as any}
      />
    </main>
  );
}
