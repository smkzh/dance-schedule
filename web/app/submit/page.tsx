import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NameSelector from "@/components/NameSelector";

export default async function SubmitPage() {
  // アクティブな公演を取得
  const { data: performance } = await supabase
    .from("performances")
    .select("id")
    .eq("is_active", true)
    .single();

  // アクティブな公演のメンバーを取得
  const { data: members } = performance
    ? await supabase
        .from("members")
        .select("id, name")
        .eq("performance_id", performance.id)
        .order("name")
    : { data: [] };

  return (
    <main className="flex flex-col items-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">日程を提出する</h1>
      <NameSelector members={members ?? []} />
      <Link href="/" className="text-sm text-gray-400 underline">
        ← ホームに戻る
      </Link>
    </main>
  );
}
