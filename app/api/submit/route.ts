import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const memberId: string = body.memberId;
    const availabilities: Record<string, string[]> = body.availabilities;

    // 既存の提出データをすべて削除する
    const { error: deleteError } = await supabase
      .from("availabilities")
      .delete()
      .eq("member_id", memberId);
    if (deleteError) throw deleteError;

    // 新しいデータを1行ずつに展開してまとめて INSERT する
    const rows = Object.entries(availabilities).flatMap(([date, slots]) =>
      slots.map((slot) => ({
        member_id: memberId,
        available_date: date,
        time_slot: slot,
      }))
    );

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("availabilities")
        .insert(rows);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
