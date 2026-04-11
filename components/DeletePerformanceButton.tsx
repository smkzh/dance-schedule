"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  performanceId: string;
  performanceName: string;
};

export default function DeletePerformanceButton({ performanceId, performanceName }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`「${performanceName}」を削除しますか？\nメンバー・ナンバー・日程データもすべて削除されます。`)) return;

    setIsDeleting(true);
    const res = await fetch(`/api/performances/${performanceId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("削除に失敗しました");
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-9 px-4 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors disabled:opacity-40"
    >
      {isDeleting ? "削除中..." : "削除"}
    </button>
  );
}
