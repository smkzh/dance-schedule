import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ numberId: string; memberId: string }> }
) {
  try {
    const { numberId, memberId } = await params;
    const { error } = await supabase
      .from("number_members")
      .delete()
      .eq("number_id", numberId)
      .eq("member_id", memberId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ numberId: string; memberId: string }> }
) {
  try {
    const { numberId, memberId } = await params;
    const { isChoreographer } = await request.json();
    const { error } = await supabase
      .from("number_members")
      .update({ is_choreographer: isChoreographer })
      .eq("number_id", numberId)
      .eq("member_id", memberId);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
