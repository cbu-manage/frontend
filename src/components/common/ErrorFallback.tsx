import Link from "next/link";

interface ErrorFallbackProps {
    message: string;
    reset?: () => void;
}

export default function ErrorFallback({ message, reset }: ErrorFallbackProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-20 text-center">
            <p className="whitespace-pre-line text-base text-gray-500 leading-relaxed">
                {message}
            </p>

            <div className="flex w-full flex-col gap-3 px-4 sm:w-auto sm:flex-row sm:px-0">
                {reset && (
                    <button
                        onClick={reset}
                        className="w-full rounded-lg bg-gray-800 px-8 py-3 text-base font-medium text-gray-0 transition-colors hover:opacity-90 active:opacity-80 sm:w-auto"
                    >
                        다시 시도
                    </button>
                )}
                <Link
                    href="/"
                    className="w-full rounded-lg bg-gray-800 px-8 py-3 text-base font-medium text-gray-0 transition-colors hover:opacity-90 active:opacity-80 sm:w-auto"
                >
                    홈으로 가기
                </Link>
            </div>
        </div>
    );
}
