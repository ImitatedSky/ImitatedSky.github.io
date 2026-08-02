import PageBanner from "../components/PageBanner";
import Comments from "../components/Comments";
import { usePageTitle } from "../hooks/usePageTitle";

export default function MessageBoardPage() {
  usePageTitle("留言板");
  return (
    <>
      <PageBanner title="留言板" subtitle="歡迎留言交流" />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
          <Comments issueTerm="messageboard" />
        </div>
      </div>
    </>
  );
}
