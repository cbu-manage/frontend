import Image from "next/image";
import Link from "next/link";

interface ErrorFallbackProps {
    status: 404 | 500 | 503;
    reset?: () => void;
    /** 개발환경에서만 렌더링되는 오류 메시지 */
    error?: Error;
}

interface StatusConfig {
    illustration: string;
    title: string;
    description: string;
}

const STATUS_CONFIG: Record<ErrorFallbackProps["status"], StatusConfig> = {
    404: {
        illustration: "/assets/sadowl.svg",
        title: "페이지를 찾을 수 없어요",
        description:
            "주소가 잘못되었거나 삭제된 페이지예요.",
    },
    500: {
        illustration: "/assets/sadowl.svg",
        title: "서버에서 오류가 발생했어요",
        description:
            "일시적인 문제가 생겼어요.\n잠시 후 다시 시도해 주세요.",
    },
    503: {
        illustration: "/assets/main_icon.svg",
        title: "서비스를 준비 중이에요",
        description:
            "유지보수 중이거나 일시적으로 중단됐어요.\n잠시 후 다시 확인해 주세요.",
    },
};

const isDev = process.env.NODE_ENV === "development";

/**
 * 에러 페이지 공통 UI 컴포넌트
 *
 * - status에 따라 일러스트·문구만 분기, 레이아웃·스타일 통일
 * - reset이 있으면 "다시 시도" 버튼, 없으면 "홈으로" 버튼만 노출
 * - 개발환경에서만 error.message 표시
 */
export default function ErrorFallback({
    status,
    reset,
    error,
}: ErrorFallbackProps) {
    const { illustration, title, description } = STATUS_CONFIG[status];

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 py-20 text-center">
            {/* 일러스트 */}
            <div className="relative h-32 w-32 sm:h-48 sm:w-48 select-none">
                <Image
                    src={illustration}
                    alt={`${status} 오류 씨부엉 마스코트`}
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* 텍스트 */}
            <div className="flex flex-col items-center gap-3">
                <span className="text-sm font-semibold text-gray-500">{status}</span>
                <h1 className="text-2xl font-bold text-gray-900 whitespace-pre-line">
                    {title}
                </h1>
                <p className="whitespace-pre-line text-base text-gray-500 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* 개발환경 오류 상세 */}
            {isDev && error?.message && (
                <pre className="max-w-xl w-full overflow-x-auto rounded-lg border border-notice/20 bg-notice/10 px-4 py-3 text-left text-sm text-notice leading-relaxed">
                    {error.message}
                </pre>
            )}

            {/* CTA 버튼 */}
            <div className="flex w-full flex-col gap-3 px-4 sm:w-auto sm:flex-row sm:px-0">
                {reset ? (
                    <>
                        <button
                            onClick={reset}
                            className="w-full rounded-lg bg-gray-800 px-8 py-3 text-base font-medium text-gray-0 transition-colors hover:opacity-90 active:opacity-80 sm:w-auto"
                        >
                            다시 시도
                        </button>
                        <Link
                            href="/"
                            className="w-full rounded-lg bg-gray-100 px-8 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-gray-200 active:bg-gray-300 sm:w-auto"
                        >
                            홈으로
                        </Link>
                    </>
                ) : (
                    <Link
                        href="/"
                        className="w-full rounded-lg bg-gray-800 px-8 py-3 text-base font-medium text-gray-0 transition-colors hover:opacity-90 active:opacity-80 sm:w-auto"
                    >
                        홈으로
                    </Link>
                )}
            </div>
        </div>
    );
}
