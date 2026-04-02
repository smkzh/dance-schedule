// 09:00〜21:30 の 30 分スロット（26個）
export const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});
