import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { numberId, memberId } = await request.json();
    const { error } = await supabase
      .from("number_members")
      .insert({ number_id: numberId, member_id: memberId, is_choreographer: false });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
