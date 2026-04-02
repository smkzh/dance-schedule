import LinkButton from "@/components/LinkButton";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="flex flex-col gap-8 w-full max-w-sm sm:max-w-md">
        <h1 className="text-2xl font-bold text-center sm:text-3xl">
          ダンススケジュール
        </h1>
        {/* モバイル: 縦並び / sm以上: 横並び */}
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
