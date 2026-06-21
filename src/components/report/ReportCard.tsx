import Link from "next/link";

type ReportCardProps = {
  id: number;
  tag: string;
  title: string;
  author: string;
  date: string;
};

export default function ReportCard({ id, tag, title, author, date }: ReportCardProps) {
  return (
    <Link
      href={`/report/${id}`}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow min-h-[140px]"
    >
      <span className="inline-block self-start rounded-full bg-report-badge px-3 py-1 text-xs font-medium text-white mb-3">
        {tag}
      </span>
      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
        {title}
      </h3>
      <p className="text-xs text-gray-400 mt-auto">
        {author} · {date}
      </p>
    </Link>
  );
}
