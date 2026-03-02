"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<"기획" | "개발" | "디자인">("기획");
  const [showArrow, setShowArrow] = useState(true);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowArrow(window.scrollY === 0);
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
      detail:
        "운영된 스터디를 바탕으로 \n6개월마다 우수 스터디를 \n시상하고 있어요!",
      icon: "📚",
    },
    {
      title: "코딩 행사 및 이벤트",
      detail:
        "#알고리즘 챌린지, #모밤코 등 \n동아리 내에서 진행하는 코딩 행사 및 \n이벤트에 참여할 수 있어요 !",
      icon: "💻",
    },
    {
      title: "풍부한 자료방 공유",
      detail:
        "IT관련 공모전 및 대외활동 정보 \n자료방을 제공해요",
      icon: "📁",
    },
  ];

  const stories = [
    {
      title: "종강 회식",
      image: "/assets/company-dinner-pic.jpg",
    },
    {
      title: "박람회 방문",
      image: "/assets/fair_pic.jpg",
    },
    {
      title: "현직자 선배의 멘토링",
      image: "/assets/mentoring_pic.jpg",
    },
    {
      title: "스터디",
      image: "/assets/study_pic.jpg",
    },
    {
      title: "프로젝트",
      image: "/assets/study2_pic.jpg",
    },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#151517" }}>
      <div className="px-[9.375%]">
        {/* 히어로: 가운데 부엉이, 호버 시 크기 확대 + owl-icon으로 전환 */}
        <div
          className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] mb-40 sm:mb-24 relative"
          onMouseEnter={() => setIsHeroHovered(true)}
          onMouseLeave={() => setIsHeroHovered(false)}
        >
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{ transform: isHeroHovered ? "scale(1.15)" : "scale(1)" }}
          >
            {/* 중앙 부엉이 아이콘 */}
            <Image
              src={isHeroHovered ? "/assets/owl-icon.svg" : "/assets/main_icon.svg"}
              alt="씨부엉"
              width={160}
              height={160}
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain transition-opacity duration-200"
            />

            {/* 호버 시 주변 장식 아이콘들 */}
            {/* 좌측 상단 - 200 OK */}
            <div
              className={`pointer-events-none absolute -top-15 -left-25 sm:-top-15 sm:-left-25 md:-top-15 md:-left-25 transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <Image
                src="/assets/200ok.svg"
                alt="200 OK"
                width={100}
                height={36}
                className="w-20 sm:w-24 md:w-28"
              />
            </div>

            {/* 좌측 중앙 - Developer */}
            <div
              className={`pointer-events-none absolute top-5 -left-40 sm:-left-40 md:-left-40 transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 -translate-x-0"
                  : "opacity-0 -translate-x-2"
              }`}
            >
              <Image
                src="/assets/Developer.svg"
                alt="Developer"
                width={110}
                height={40}
                className="w-20 sm:w-24 md:w-28"
              />
            </div>

            {/* 좌측 하단 - PM 아이콘 */}
            <div
              className={`pointer-events-none absolute bottom-5 -left-32 sm:bottom-5 sm:-left-32 md:bottom-5 md:-left-32 transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <Image
                src="/assets/PM.svg"
                alt="PM"
                width={80}
                height={80}
                className="w-25 h-25 sm:w-25 sm:h-25"
              />
            </div>

            {/* 우측 상단 - IF */}
            <div
              className={`pointer-events-none absolute -top-14 -right-10 sm:-top-16 sm:-right-10 md:-top-18 md:-right-10 transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 -translate-y-0"
                  : "opacity-0 -translate-y-2"
              }`}
            >
              <Image
                src="/assets/IF.svg"
                alt="IF"
                width={80}
                height={80}
                className="w-13 h-13"
              />
            </div>

            {/* 부엉이 머리 위쪽 - 클로버
            <div
              className={`pointer-events-none absolute -top-35 left-10 transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-75"
              }`}
            >
              <Image
                src="/assets/clover.svg"
                alt="clover"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div> */}

            {/* 우측 중앙 - Design (붓 아이콘) */}
            <div
              className={`pointer-events-none absolute -top-10 -right-35 sm:-top-10 sm:-right-35 md:-top-10 md:-right-35 transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-3"
              }`}
            >
              <Image
                src="/assets/Design.svg"
                alt="Design"
                width={72}
                height={72}
                className="w-15 h-15 sm:w-15 sm:h-15"
              />
            </div>

            {/* 우측 중앙 - Let's CBU */}
            <div
              className={`pointer-events-none absolute top-8 right-[-200px] sm:top-10 sm:right-[-200px] md:top-12 md:right-[-200px] transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-3"
              }`}
            >
              <Image
                src="/assets/ler'scbu.svg"
                alt="Let's CBU"
                width={140}
                height={44}
                className="w-28 sm:w-32 md:w-36"
              />
            </div>

            {/* 우측 하단 - DE (코드 아이콘, 조금 위쪽) */}
            <div
              className={`pointer-events-none absolute -bottom-5 -right-35 sm:-bottom-5 sm:-right-35 md:-bottom-5 md:-right-35 transition-all duration-300 ${
                isHeroHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <Image
                src="/assets/DE.svg"
                alt="Code"
                width={72}
                height={72}
                className="w-30 h-30 sm:w-30 sm:h-30"
              />
            </div>
          </div>

          {/* 호버 시 부엉이 밑 환영 문구 */}
          <div
            className={`flex flex-col items-center gap-3 mt-20 text-center transition-opacity duration-300 ${
              isHeroHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <h2
              className="font-bold tracking-tight text-xl sm:text-3xl lg:text-[42px] leading-tight"
              style={{
                background:
                  "radial-gradient(419.6% 101.53% at 0% 50.88%, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.90) 35%, rgba(255, 255, 255, 0.75) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              씨부엉에 오신 것을 환영합니다.
            </h2>
            <p className="text-[#F2F2F2] font-medium text-sm sm:text-base lg:text-lg tracking-tight opacity-70">
              본 사이트는 한국공학대학교 프로그래밍 동아리 씨부엉의 효율적인 회원관리를 위한 웹사이트입니다.
            </p>
            <a
              href="https://forms.gle/mjibpj7qBiKRrChm8"
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-4 inline-flex h-10 px-5 py-2
                items-center justify-center gap-3
                rounded-full bg-[#F2F2F2]
                text-sm sm:text-base font-semibold tracking-tight
                text-[#151517]
                hover:bg-white hover:shadow-md
                transition-colors transition-shadow
              "
            >
              28기 씨부엉 신청하기
            </a>
          </div>

          {/* SCROLL DOWN - 메인 페이지 & 맨 위일 때만 표시 */}
          {showArrow && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
              <span
                className="text-center text-xs font-normal"
                style={{
                  color: "#E6E6E6",
                  fontFamily: '"neurimbo Gothic", sans-serif',
                  letterSpacing: "1.2px",
                }}
              >
                SCROLL DOWN
              </span>
              <Image
                src="/assets/scroll-down.svg"
                alt="스크롤 다운"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
          )}
        </div>

        {/* CBU ACTIVITY 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-2">
              CBU ACTIVITY
            </h2>
            <p className="text-lg text-zinc-300">
              각 분야별로 스터디와 프로젝트를 통해 함께 성장해 나가요.
            </p>
          </div>

          {/* 활동 카드 그리드 */}
          <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {activities.map((activity, idx) => (
             <div
             key={idx}
             className="group relative w-full max-w-80 h-80 rounded-3xl bg-[#212123] px-10 py-10 flex flex-col items-center justify-center text-center transition-all duration-300"
           >
             {/* 공통 헤더 (항상 보임) */}
             <div className="flex flex-col items-center gap-6 z-10">
               <div
                 className="flex items-center justify-center text-white text-xs font-semibold rounded-full"
                 style={{
                   width: "33px",
                   height: "33px",
                   padding: "4.529px 0 3.471px 0",
                   background:
                     "linear-gradient(141deg, #90B97C 4.39%, #6CDAFF 95.61%)",
                 }}
               >
                 {idx + 1}
               </div>
           
               <h3 className="text-xl font-bold text-white">
                 {activity.title}
               </h3>
           
               {/* 기본 상태 아이콘 */}
               <div className="text-7xl transition-opacity duration-300 group-hover:opacity-20">
                 {activity.icon}
               </div>
             </div>
           
             {/* 호버 오버레이 (디테일만) */}
             <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-8 pt-10 pb-20 text-center bg-[rgba(0,0,0,0.56)] backdrop-blur-[2px]">
               <p className="text-sm sm:text-base text-zinc-200 leading-relaxed max-w-md mt-35" style={{ whiteSpace: 'pre-line' }}>
                 {activity.detail}
               </p>
             </div>
           </div>
            ))}
          </div>
        </div>

        {/* CBU COMPOSITION 섹션 */}
        <div
          id="cbu-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 py-40 mt-4 sm:mt-10"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">
              CBU COMPOSITION
            </h2>
            <p className="text-lg text-zinc-300">
              각 파트별 구성과 역할을 확인해 보세요.
            </p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 rounded-full bg-[#2F2F31] px-2 py-1">
              {(["기획", "개발", "디자인"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all
                    ${
                      selectedTab === tab
                        ? "bg-[#50CA73] text-black"
                        : "bg-transparent text-zinc-300 hover:text-white"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 선택된 탭의 콘텐츠 카드 */}
          <div className="relative mt-10">
            <div
              className="bg-white/5 rounded-2xl p-10 md:p-14 text-white border border-white/10 relative overflow-hidden"
              style={{
                backgroundImage: "url('/assets/main_circles.svg')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right center",
                backgroundSize: "auto 100%",
              }}
            >
              <div className="relative z-10">
                <div className="mb-4">
                  <span className="text-sm text-zinc-400 mb-2 block">
                    {tabContents[selectedTab].label}
                  </span>
                  <h3 className="text-5xl md:text-5xl font-bold mb-6">
                    {tabContents[selectedTab].title}
                  </h3>
                </div>
                <div className="space-y-2">
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

        {/* CBU STORY 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">CBU STORY</h2>
            <p className="text-lg text-zinc-300">
              씨부엉은 이런 활동들을 하고 있어요.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex w-max gap-10 animate-[cbu-marquee_60s_linear_infinite]">
              {[0, 1].map((loopIndex) => (
                <div key={loopIndex} className="flex gap-10">
                  {stories.map((story, idx) => (
                    <div
                      key={`${story.title}-${loopIndex}-${idx}`}
                      className="shrink-0 w-[260px] sm:w-[360px] lg:w-[500px] xl:w-[649px] h-[220px] sm:h-[280px] lg:h-[360px] xl:h-[437px] rounded-[32px] relative overflow-hidden bg-[#737373]"
                    >
                      {/* 배경 사진 */}
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        className="object-cover"
                      />
                      {/* 그라데이션 + 어둡게 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(217,217,217,0)] to-[#737373]" />
                      <div className="absolute inset-0 bg-zinc-900/35" />

                      {/* 타이틀 */}
                      <div className="relative z-10 flex h-full items-end px-6 sm:px-8 pb-6 sm:pb-8">
                        <div>
                          <p className="text-lg sm:text-xl font-semibold text-white">
                            {story.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
