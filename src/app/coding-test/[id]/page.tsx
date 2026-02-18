"use client";

import { useParams, useRouter } from "next/navigation";
import DetailTemplate from "@/components/detail/DetailTemplate";
import Image from "next/image";
import { CommentInput, CommentItem } from "@/components/detail/CommentSection";
import { useState } from "react";
import { useUserStore } from "@/store/userStore";

const MOCK_DATA = {
  title: "백준 12865번 평범한 배낭 풀이",
  status: "solved" as const,
  author: "31기 씨부엉",
  date: "2026. 01. 20",
  views: 312,
  infoLabel: "문제 정보",
  categories: ["Python", "백준", "DP"],
  content: `## 문제 설명
N개의 물건이 있고, 각 물건은 무게 W와 가치 V를 가집니다.
배낭에 담을 수 있는 최대 무게가 K일 때, 배낭에 담을 수 있는 물건들의 가치의 최댓값을 구하는 문제입니다.

## 풀이 방법
이 문제는 전형적인 0/1 배낭 문제(Knapsack Problem)로, 다이나믹 프로그래밍(DP)을 이용해 해결할 수 있습니다.

\`\`\`python
import sys

def solve():
    n, k = map(int, sys.stdin.readline().split())
    items = [[0, 0]]
    for _ in range(n):
        items.append(list(map(int, sys.stdin.readline().split())))
    
    dp = [[0] * (k + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for j in range(1, k + 1):
            w = items[i][0]
            v = items[i][1]
            
            if j < w:
                dp[i][j] = dp[i-1][j]
            else:
                dp[i][j] = max(dp[i-1][j], dp[i-1][j-w] + v)
                
    print(dp[n][k])

solve()
\`\`\`

## 시간 복잡도
O(N * K)의 시간 복잡도로 해결 가능합니다.`,
};

const MOCK_COMMENTS = [
  {
    id: 1,
    author: "34기 씨부엉",
    content: "저도 참여하고싶습니다 !!!",
    date: "2026.01.30",
    replies: [
      {
        id: 2,
        author: "31기 씨부엉",
        content: "언제든지 환영입니다! 궁금한 점 있으시면 언제든 물어보세요.",
        date: "2026.01.31",
        replies: []
      },
      {
        id: 3,
        author: "33기 씨부엉",
        content: "저도 같이 하고 싶어요! 스터디 일정 어떻게 되나요?",
        date: "2026.01.31",
        replies: []
      },
      {
        id: 4,
        author: "32기 씨부엉",
        content: "저도요! 참여 방법 알려주시면 감사하겠습니다.",
        date: "2026.02.01",
        replies: []
      },
      {
        id: 5,
        author: "35기 씨부엉",
        content: "신청은 어디서 하면 되나요?",
        date: "2026.02.01",
        replies: []
      }
    ]
  },
  {
    id: 6,
    author: "33기 씨부엉",
    content: "DP 테이블을 1차원으로만 써서 공간 복잡도 줄이는 방법도 있더라구요. 나중에 최적화 버전도 공유해주시면 좋겠어요!",
    date: "2026.01.31",
    replies: []
  },
  {
    id: 7,
    author: "32기 씨부엉",
    content: "이 문제 진짜 클래식한데, 면접에서도 자주 나온다고 들었어요. 한번 풀어보려다가 막혀서 풀이 감사합니다!",
    date: "2026.02.01",
    replies: [
      {
        id: 8,
        author: "31기 씨부엉",
        content: "도움이 되었다니 다행이에요. 비슷한 유형으로 2293번 동전 1도 추천해요!",
        date: "2026.02.01",
        replies: []
      }
    ]
  },
  {
    id: 9,
    author: "35기 씨부엉",
    content: "items를 [0,0]으로 초기화하고 인덱스 1부터 쓰는 이유가 뭔가요? 0부터 쓰면 안 되나요?",
    date: "2026.02.02",
    replies: [
      {
        id: 10,
        author: "31기 씨부엉",
        content: "0번 인덱스를 비워두면 dp[i-1] 접근할 때 인덱스 예외 없이 깔끔하게 쓸 수 있어요. 0부터 써도 되는데 그럼 dp 초기화할 때 범위만 조금 다르게 잡으면 됩니다.",
        date: "2026.02.02",
        replies: [
          {
            id: 11,
            author: "35기 씨부엉",
            content: "아 이해했어요. 답변 감사합니다!",
            date: "2026.02.02",
            replies: []
          }
        ]
      }
    ]
  },
  {
    id: 12,
    author: "30기 씨부엉",
    content: "작년에도 이 문제로 스터디 했었는데, 올해 풀이 보니까 다시 복습하기 좋네요. 공유해주셔서 감사합니다.",
    date: "2026.02.03",
    replies: []
  },
  {
    id: 13,
    author: "34기 씨부엉",
    content: "Python으로 풀 때 sys.stdin 쓰는 게 input()보다 빠른가요?",
    date: "2026.02.03",
    replies: [
      {
        id: 14,
        author: "31기 씨부엉",
        content: "네, 백준처럼 입력이 많을 때는 sys.stdin.readline()이 훨씬 빠릅니다. 시간 초과 나면 한번 바꿔보세요!",
        date: "2026.02.03",
        replies: []
      }
    ]
  }
];

export default function CodingTestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const name = useUserStore((s) => s.name);
  const isMember = !!name;

  // 댓글 수 계산
  const countComments = (comments: any[]): number => {
    return comments.reduce((acc, comment) => {
      return acc + 1 + (comment.replies ? countComments(comment.replies) : 0);
    }, 0);
  };

  const totalCommentsCount = countComments(MOCK_COMMENTS);

  return (
    <main className="min-h-screen bg-white">
      <DetailTemplate
        backPath="/coding-test"
        hasSidebar={false}
        isMarkdown={true}
        commentsCount={isMember ? totalCommentsCount : 0}
        {...MOCK_DATA}
        showCommentsCount={isMember}
        onEdit={() => {
          const payload = {
            id: String(params.id),
            title: MOCK_DATA.title,
            categories: MOCK_DATA.categories,
            solveStatus: MOCK_DATA.status,
            content: MOCK_DATA.content,
          };
          sessionStorage.setItem("editPost_codingtest", JSON.stringify(payload));
          router.push(`/coding-test/write?id=${params.id}`);
        }}
        comments={
          isMember ? (
            <div className="space-y-12">
              {totalCommentsCount === 0 ? (
                <div className="space-y-12">
                  <CommentInput />
                  <div className="flex flex-col items-center justify-center py-20">
                    <Image src="/assets/sadowl.svg" alt="댓글 없음" width={120} height={120} className="mb-6" />
                    <p className="text-[20px] font-semibold text-[#3E434A] leading-[160%] text-center">
                      첫 번째 댓글을 남겨주세요!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="space-y-6">
                    {MOCK_COMMENTS.map((comment) => (
                      <CommentItem 
                        key={comment.id}
                        {...comment} 
                        activeReplyId={activeReplyId}
                        onReplyClick={setActiveReplyId}
                      />
                    ))}
                  </div>
                  <CommentInput />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-[20px] font-semibold text-[#3E434A] leading-[160%] text-center">
                댓글을 보려면 로그인해주세요!
              </p>
            </div>
          )
        }
      />
    </main>
  );
}
