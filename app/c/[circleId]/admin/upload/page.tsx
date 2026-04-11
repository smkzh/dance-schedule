"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// CSVのテキストを行ごとのオブジェクト配列に変換する
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

type PreviewData = {
  members: Record<string, string>[];
  numberMembers: Record<string, string>[];
};

export default function AdminUploadPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const [performanceName, setPerformanceName] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"success" | "error" | null>(null);
  const [membersFileName, setMembersFileName] = useState("");
  const [numbersFileName, setNumbersFileName] = useState("");
  const membersInputRef = useRef<HTMLInputElement>(null);
  const numbersInputRef = useRef<HTMLInputElement>(null);

  async function handlePreview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPreview(null);

    const form = e.currentTarget;
    const membersFile = (form.elements.namedItem("membersFile") as HTMLInputElement).files?.[0];
    const numbersFile = (form.elements.namedItem("numbersFile") as HTMLInputElement).files?.[0];

    if (!performanceName.trim()) {
      setError("公演名を入力してください");
      return;
    }
    if (!membersFile || !numbersFile) {
      setError("2つのCSVファイルを選択してください");
      return;
    }

    const membersText = await membersFile.text();
    const numbersText = await numbersFile.text();

    setSaveResult(null);
    setPreview({
      members: parseCsv(membersText),
      numberMembers: parseCsv(numbersText),
    });
  }

  async function handleSave() {
    if (!preview) return;
    setIsSaving(true);
    setSaveResult(null);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        circleId,
        performanceName,
        memberNames: preview.members.map((r) => r.member_name),
        numberMembers: preview.numberMembers,
      }),
    });

    setIsSaving(false);
    setSaveResult(res.ok ? "success" : "error");
  }

  return (
    <main className="flex flex-col items-center min-h-screen gap-8 p-8">
      <div className="w-full max-w-md">
        <Link href={`/c/${circleId}/admin`} className="text-sm text-gray-400 underline">
          ← 管理ページに戻る
        </Link>
      </div>
      <h1 className="text-2xl font-bold">CSVアップロード</h1>

      <form onSubmit={handlePreview} className="flex flex-col gap-6 w-full max-w-md">
        {/* 公演名 */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">公演名</label>
          <input
            type="text"
            value={performanceName}
            onChange={(e) => setPerformanceName(e.target.value)}
            placeholder="例: 春公演2026"
            className="border border-gray-300 rounded-lg px-4 h-11 focus:outline-none focus:border-black"
          />
        </div>

        {/* メンバー一覧CSV */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">メンバー一覧CSV</label>
          <p className="text-sm text-gray-500">ヘッダー: member_name</p>
          <input
            ref={membersInputRef}
            type="file"
            name="membersFile"
            accept=".csv"
            className="hidden"
            onChange={(e) => setMembersFileName(e.target.files?.[0]?.name ?? "")}
          />
          <button
            type="button"
            onClick={() => membersInputRef.current?.click()}
            className="h-11 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors px-4 text-left"
          >
            {membersFileName || "ファイルを選択"}
          </button>
        </div>

        {/* ナンバーと出演者CSV */}
        <div className="flex flex-col gap-2">
          <label className="font-medium">ナンバーと出演者CSV</label>
          <p className="text-sm text-gray-500">ヘッダー: number_name, choreographer, member_name</p>
          <input
            ref={numbersInputRef}
            type="file"
            name="numbersFile"
            accept=".csv"
            className="hidden"
            onChange={(e) => setNumbersFileName(e.target.files?.[0]?.name ?? "")}
          />
          <button
            type="button"
            onClick={() => numbersInputRef.current?.click()}
            className="h-11 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors px-4 text-left"
          >
            {numbersFileName || "ファイルを選択"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="h-11 rounded-lg bg-black text-white font-medium hover:opacity-80 transition-opacity"
        >
          プレビューを確認する
        </button>
      </form>

      {/* プレビュー */}
      {preview && (
        <div className="flex flex-col gap-8 w-full max-w-2xl">
          <div>
            <h2 className="font-bold text-lg mb-3">
              公演名: {performanceName}
            </h2>
          </div>

          {/* メンバー一覧 */}
          <div>
            <h3 className="font-medium mb-2">メンバー一覧（{preview.members.length}名）</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-2 text-left">名前</th>
                </tr>
              </thead>
              <tbody>
                {preview.members.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-200 px-4 py-2">{row.member_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ナンバーと出演者 */}
          <div>
            <h3 className="font-medium mb-2">ナンバーと出演者（{preview.numberMembers.length}行）</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-2 text-left">ナンバー名</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">振り付け者</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">出演者</th>
                </tr>
              </thead>
              <tbody>
                {preview.numberMembers.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-gray-200 px-4 py-2">{row.number_name}</td>
                    <td className="border border-gray-200 px-4 py-2">{row.choreographer}</td>
                    <td className="border border-gray-200 px-4 py-2">{row.member_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-11 rounded-lg bg-black text-white font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              {isSaving ? "保存中..." : "Supabaseに保存する"}
            </button>
            {saveResult === "success" && (
              <p className="text-green-600 text-sm">保存しました</p>
            )}
            {saveResult === "error" && (
              <p className="text-red-500 text-sm">保存に失敗しました</p>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
