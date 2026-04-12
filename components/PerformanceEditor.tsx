"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = { id: string; name: string };

type NumberMember = {
  member_id: string;
  is_choreographer: boolean;
  members: { id: string; name: string };
};

type NumberRow = {
  id: string;
  name: string;
  number_members: NumberMember[];
};

type Props = {
  performance: { id: string; name: string };
  members: Member[];
  numbers: NumberRow[];
};

export default function PerformanceEditor({ performance, members, numbers }: Props) {
  const router = useRouter();

  // --- 公演名 ---
  const [perfName, setPerfName] = useState(performance.name);
  const [isSavingPerf, setIsSavingPerf] = useState(false);

  async function handleSavePerformanceName() {
    setIsSavingPerf(true);
    await fetch(`/api/performances/${performance.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: perfName }),
    });
    setIsSavingPerf(false);
    router.refresh();
  }

  // --- メンバー追加 ---
  const [newMemberName, setNewMemberName] = useState("");

  async function handleAddMember() {
    if (!newMemberName.trim()) return;
    await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ performanceId: performance.id, name: newMemberName.trim() }),
    });
    setNewMemberName("");
    router.refresh();
  }

  // --- ナンバー追加 ---
  const [newNumberName, setNewNumberName] = useState("");

  async function handleAddNumber() {
    if (!newNumberName.trim()) return;
    await fetch("/api/numbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ performanceId: performance.id, name: newNumberName.trim() }),
    });
    setNewNumberName("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-10 w-full max-w-lg">

      {/* 公演名 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-lg border-b border-gray-200 pb-2">公演名</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={perfName}
            onChange={(e) => setPerfName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 h-10 focus:outline-none focus:border-black text-sm"
          />
          <button
            onClick={handleSavePerformanceName}
            disabled={isSavingPerf || perfName === performance.name}
            className="h-10 px-4 rounded-lg bg-black text-white text-sm hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            保存
          </button>
        </div>
      </section>

      {/* メンバー */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-lg border-b border-gray-200 pb-2">メンバー</h2>
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} onDone={() => router.refresh()} />
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="メンバー名"
            className="flex-1 border border-gray-300 rounded-lg px-4 h-10 focus:outline-none focus:border-black text-sm"
          />
          <button
            onClick={handleAddMember}
            disabled={!newMemberName.trim()}
            className="h-10 px-4 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            追加
          </button>
        </div>
      </section>

      {/* ナンバー */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-lg border-b border-gray-200 pb-2">ナンバー</h2>
        <div className="flex flex-col gap-4">
          {numbers.map((number) => (
            <NumberRowItem
              key={number.id}
              number={number}
              allMembers={members}
              onDone={() => router.refresh()}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={newNumberName}
            onChange={(e) => setNewNumberName(e.target.value)}
            placeholder="ナンバー名"
            className="flex-1 border border-gray-300 rounded-lg px-4 h-10 focus:outline-none focus:border-black text-sm"
          />
          <button
            onClick={handleAddNumber}
            disabled={!newNumberName.trim()}
            className="h-10 px-4 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            追加
          </button>
        </div>
      </section>

    </div>
  );
}

// --- メンバー行 ---
function MemberRow({ member, onDone }: { member: Member; onDone: () => void }) {
  const [editName, setEditName] = useState(member.name);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave() {
    await fetch(`/api/members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setIsEditing(false);
    onDone();
  }

  async function handleDelete() {
    if (!confirm(`「${member.name}」を削除しますか？`)) return;
    await fetch(`/api/members/${member.id}`, { method: "DELETE" });
    onDone();
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 h-9 focus:outline-none focus:border-black text-sm"
          />
          <button
            onClick={handleSave}
            disabled={!editName.trim()}
            className="h-9 px-3 rounded-lg bg-black text-white text-sm hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            保存
          </button>
          <button
            onClick={() => { setIsEditing(false); setEditName(member.name); }}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{member.name}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
          >
            編集
          </button>
          <button
            onClick={handleDelete}
            className="h-9 px-3 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors"
          >
            削除
          </button>
        </>
      )}
    </div>
  );
}

// --- ナンバー行 ---
function NumberRowItem({
  number,
  allMembers,
  onDone,
}: {
  number: NumberRow;
  allMembers: Member[];
  onDone: () => void;
}) {
  const [editName, setEditName] = useState(number.name);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingChoreographer, setIsEditingChoreographer] = useState(false);
  const [addMemberId, setAddMemberId] = useState("");

  const castMemberIds = new Set(number.number_members.map((nm) => nm.member_id));
  const availableMembers = allMembers.filter((m) => !castMemberIds.has(m.id));

  async function handleSaveName() {
    await fetch(`/api/numbers/${number.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setIsEditing(false);
    onDone();
  }

  async function handleDeleteNumber() {
    if (!confirm(`「${number.name}」を削除しますか？`)) return;
    await fetch(`/api/numbers/${number.id}`, { method: "DELETE" });
    onDone();
  }

  async function handleAddCast() {
    if (!addMemberId) return;
    await fetch("/api/number-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numberId: number.id, memberId: addMemberId }),
    });
    setAddMemberId("");
    onDone();
  }

  async function handleRemoveCast(memberId: string) {
    await fetch(`/api/number-members/${number.id}/${memberId}`, { method: "DELETE" });
    onDone();
  }

  async function handleToggleChoreographer(memberId: string, current: boolean) {
    await fetch(`/api/number-members/${number.id}/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isChoreographer: !current }),
    });
    onDone();
  }

  return (
    <div className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg">
      {/* ナンバー名 */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 h-9 focus:outline-none focus:border-black text-sm"
            />
            <button
              onClick={handleSaveName}
              disabled={!editName.trim()}
              className="h-9 px-3 rounded-lg bg-black text-white text-sm hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              保存
            </button>
            <button
              onClick={() => { setIsEditing(false); setEditName(number.name); }}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 font-medium text-sm">{number.name}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
            >
              編集
            </button>
            <button
              onClick={handleDeleteNumber}
              className="h-9 px-3 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </>
        )}
      </div>

      {/* 出演者一覧 */}
      <div className="flex flex-col gap-1 pl-2">
        {[...number.number_members].sort((a, b) => a.member_id.localeCompare(b.member_id)).map((nm) => (
          <div key={nm.member_id} className="flex items-center gap-2 text-sm">
            <div className="w-10 flex items-center">
              {isEditingChoreographer ? (
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nm.is_choreographer}
                    onChange={() => handleToggleChoreographer(nm.member_id, nm.is_choreographer)}
                  />
                </label>
              ) : (
                nm.is_choreographer && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">振付</span>
                )
              )}
            </div>
            <span className="flex-1">{nm.members.name}</span>
            <button
              onClick={() => handleRemoveCast(nm.member_id)}
              className="text-red-400 hover:text-red-600 text-xs"
            >
              削除
            </button>
          </div>
        ))}
      </div>
      {/* 振付者変更ボタン */}
      <div className="pl-2">
        <button
          onClick={() => setIsEditingChoreographer((v) => !v)}
          className="text-xs text-gray-500 underline"
        >
          {isEditingChoreographer ? "振付者の変更を完了" : "振付者を変更"}
        </button>
      </div>

      {/* 出演者追加 */}
      {availableMembers.length > 0 && (
        <div className="flex gap-2 pl-2">
          <select
            value={addMemberId}
            onChange={(e) => setAddMemberId(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 h-9 focus:outline-none focus:border-black text-sm"
          >
            <option value="">出演者を追加...</option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddCast}
            disabled={!addMemberId}
            className="h-9 px-3 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            追加
          </button>
        </div>
      )}
    </div>
  );
}
