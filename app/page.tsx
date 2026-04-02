import LinkButton from "@/components/LinkButton";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: performance } = await supabase
    .from("performances")
    .select("name")
    .eq("is_active", true)
    .single();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="flex flex-col gap-8 w-full max-w-sm sm:max-w-md">
        <h1 className="text-2xl font-bold text-center sm:text-3xl">
          {performance?.name ?? "公演が登録されていません"}
        </h1>
        <div className="flex flex-col gap-4 sm:flex-row">
          <LinkButton href="/submit" variant="primary">
            日程を提出する
          </LinkButton>
          <LinkButton href="/numbers" variant="secondary">
            候補日を確認する
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
