import Link from "next/link";

type ReportCardProps = {
  id: number;
  tag: string;
  title: string;
  author: string;
  date: string;
  files: string[];
};

export default function ReportCard({ id, tag, title, author, date, files }: ReportCardProps) {
  return (
    <Link
      href={`/report/${id}`}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow min-h-[140px]"
    >
      <span className="inline-block self-start rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700 mb-3">
        {tag}
      </span>
      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
        {title}
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        {author} · {date}
      </p>
      <div className="flex justify-end gap-1 mt-auto">
        {files.map((f) => (
          <span
            key={f}
            className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-500 font-medium"
          >
            {f}
          </span>
        ))}
      </div>
    </Link>
  );
}
