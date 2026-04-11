import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: circle } = await supabase
    .from("circles")
    .select("id")
    .single();

  if (circle) {
    redirect(`/c/${circle.id}`);
  }

  return <p>サークルが登録されていません</p>;
}
