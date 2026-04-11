import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NameSelector from "@/components/NameSelector";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ circleId: string; performanceId: string }>;
}) {
  const { circleId, performanceId } = await params;

  const { data: members } = await supabase
    .from("members")
    .select("id, name")
    .eq("performance_id", performanceId)
    .order("name");

  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <div className="w-full max-w-sm">
        <Link href={`/c/${circleId}`} className="text-sm text-gray-400 underline">
          ← ホームに戻る
        </Link>
      </div>
      <h1 className="text-2xl font-bold">日程を提出する</h1>
      <NameSelector members={members ?? []} />
    </main>
  );
}
