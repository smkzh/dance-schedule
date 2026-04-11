import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

type NumberMemberRow = {
  number_name: string;
  choreographer: string;
  member_name: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const circleId: string = body.circleId;
    const performanceName: string = body.performanceName;
    const memberNames: string[] = body.memberNames;
    const numberMembers: NumberMemberRow[] = body.numberMembers;

    // 1. 新しい公演を作成する
    const { data: performance, error: perfError } = await supabase
      .from("performances")
      .insert({ name: performanceName, circle_id: circleId })
      .select("id")
      .single();
    if (perfError) throw perfError;

    // 3. メンバーを登録する
    const { data: insertedMembers, error: membersError } = await supabase
      .from("members")
      .insert(memberNames.map((name) => ({ performance_id: performance.id, name })))
      .select("id, name");
    if (membersError) throw membersError;

    // 名前 → id のマップを作る（後でナンバーと紐付けるために使う）
    const memberMap: Record<string, string> = Object.fromEntries(
      insertedMembers.map((m) => [m.name, m.id])
    );

    // 4. ナンバーを登録する（CSVに同じナンバーが複数行あるので重複を除く）
    const uniqueNumberNames = [...new Set(numberMembers.map((r) => r.number_name))];
    const { data: insertedNumbers, error: numbersError } = await supabase
      .from("numbers")
      .insert(uniqueNumberNames.map((name) => ({ performance_id: performance.id, name })))
      .select("id, name");
    if (numbersError) throw numbersError;

    // ナンバー名 → id のマップ
    const numberMap: Record<string, string> = Object.fromEntries(
      insertedNumbers.map((n) => [n.name, n.id])
    );

    // 5. 出演者の紐付けを登録する
    const { error: nmError } = await supabase
      .from("number_members")
      .insert(
        numberMembers.map((r) => ({
          number_id: numberMap[r.number_name],
          member_id: memberMap[r.member_name],
          is_choreographer: r.choreographer === r.member_name,
        }))
      );
    if (nmError) throw nmError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
