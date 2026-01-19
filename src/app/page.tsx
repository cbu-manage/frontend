"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<"기획" | "개발" | "디자인">("기획");
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setShowArrow(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabContents = {
    기획: {
      label: "PM",
      title: "기획",
      description: [
        "기획 파트는 사용자 문제를 발견하고, 이를 서비스의 목표와 구조로 정리하는 역할을 담당합니다.",
        "즉, \"무엇을 만들 것인가?\", \"왜 필요한가?\", \"누구를 위한 서비스인가?\"를 정의합니다."
      ]
    },
    개발: {
      label: "DEV",
      title: "개발",
      description: [
        "개발 파트는 기획된 서비스를 실제로 구현하는 역할을 담당합니다.",
        "프론트엔드와 백엔드 개발을 통해 사용자에게 가치 있는 서비스를 제공합니다."
      ]
    },
    디자인: {
      label: "DESIGN",
      title: "디자인",
      description: [
        "디자인 파트는 사용자 경험과 인터페이스를 설계하는 역할을 담당합니다.",
        "사용자가 직관적이고 편리하게 서비스를 이용할 수 있도록 시각적 요소를 구성합니다."
      ]
    }
  };

  const activities = [
    {
      title: "스터디 운영",
      description: "씨부엉에서는 운영한 스터디를 바탕으로 6개월마다 우수 스터디를 시상하고 있어요!",
      icon: "📚"
    },
    {
      title: "자율 프로젝트",
      description: "소규모 자율 프로젝트를 진행하면서 포트폴리오를 쌓아올려요!",
      icon: "💼"
    },
    {
      title: "풍부한 자료방 공유",
      description: "IT관련 공모전 및 대외활동 정보 자료방을 제공해요",
      icon: "📁"
    },
    {
      title: "코딩 행사 및 이벤트",
      description: "#알고리즘 챌린지 #모밤코 등 동아리 내에서 진행하는 코딩 행사 및 이벤트에 참여할 수 있어요!",
      icon: "🎉"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-0">
      {/* 환영 메시지 섹션 */}
      <div className="flex flex-col items-center justify-center min-h-[100vh] mb-40 sm:mb-24">
        <div className="text-center">
          <div className="text-3xl font-semibold text-zinc-900">
            <span className="text-[#95C674] font-semibold">씨부엉</span>에 오신 것을 환영합니다.
          </div>
          <p className="text-xl text-neutral-600 mt-2 mb-9">
            한국공학대학교 프로그래밍 동아리 씨부엉의 공식 웹사이트입니다.
          </p>
        </div>
      </div>

      {/* 아래로 스크롤 안내 화살표 - 하단 중간 고정 */}
      {showArrow && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-zinc-300 text-zinc-500 bg-white/80 backdrop-blur-sm shadow-lg animate-bounce">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* CBU 구성 섹션 */}
      <div id="cbu-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">
            CBU는 이렇게 구성되어 있어요!
          </h2>
          <p className="text-lg text-neutral-600">
            각 분야별로 스터디를 통해 함께 배우며 발전해 나가요.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center gap-3 mb-10">
          {(["기획", "개발", "디자인"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-3 rounded-lg text-base font-medium transition-all ${
                selectedTab === tab
                  ? "bg-zinc-800 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 선택된 탭의 콘텐츠 카드 */}
        <div className="relative mt-10">
          <div className="bg-zinc-800 rounded-2xl p-10 md:p-14 text-white relative overflow-hidden">
            {/* 장식용 원들 */}
            <div className="absolute top-4 right-8 flex gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
              <div className="w-4 h-4 rounded-full bg-zinc-600"></div>
            </div>

            <div className="relative z-10">
              <div className="mb-4">
                <span className="text-sm text-zinc-400 mb-2 block">
                  {tabContents[selectedTab].label}
                </span>
                <h3 className="text-4xl md:text-5xl font-bold mb-6">
                  {tabContents[selectedTab].title}
                </h3>
              </div>
              <div className="space-y-4">
                {tabContents[selectedTab].description.map((text, idx) => (
                  <p key={idx} className="text-lg text-zinc-200 leading-relaxed">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 활동 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-40 mt-4 sm:mt-10">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">
            CBU에서는 어떤 활동을 진행할까요?
          </h2>
          <p className="text-lg text-neutral-600">
            각 분야별로 스터디&프로젝트를 통해 함께 발전해 나가요!
          </p>
        </div>

        {/* 활동 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {activities.map((activity, idx) => (
            <div
              key={idx}
              className="w-full aspect-[710/448] bg-white rounded-xl p-6 md:p-8 shadow-sm border border-zinc-100 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="text-4xl mb-4">{activity.icon}</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">
                {activity.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
