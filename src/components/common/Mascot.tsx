import { cn } from "@/lib/utils";

const SIZE_PX = { sm: 40, md: 80, lg: 160 } as const;

export type MascotEmotion = "default" | "heart" | "sad" | "working";
export type MascotSize = keyof typeof SIZE_PX;

type MascotProps = {
  emotion?: MascotEmotion;
  size?: MascotSize;
  className?: string;
  title?: string;
};

/**
 * 씨부엉 마스코트(올빼미) — 인라인 SVG. 감정(default/heart) × 사이즈(sm/md/lg).
 * 빈 상태·완료 안내 등에 사용. (Figma: Component/Mascot)
 *
 * 인라인 SVG로 가져온 이유: 크기 변해도 깨지지 않고(벡터), 추가 네트워크 요청 없음.
 * sad = Figma Mascot form=sad,size=L 기준 인라인(감은 눈+눈물). 댓글 빈 상태 등에 사용.
 *
 * @example <Mascot emotion="heart" size="lg" />
 */
export default function Mascot({
  emotion = "default",
  size = "md",
  className,
  title = "씨부엉 마스코트",
}: MascotProps) {
  const px = SIZE_PX[size];
  const common = { width: px, height: px, className: cn("select-none", className) };

  if (emotion === "heart") {
    return (
      <svg
        {...common}
        viewBox="0 0 93 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <path
          d="M50.8704 6.6131C73.7565 9.54057 90.1977 28.4203 87.5931 48.7823C86.4308 57.8682 81.6707 65.7112 74.7238 71.3543L75.4325 82.6232C75.4882 83.5095 74.5267 84.0949 73.7648 83.6385L63.8146 77.6785C57.0659 80.3235 49.3865 81.3669 41.4383 80.3502C18.5523 77.4227 2.11115 58.5429 4.71563 38.181C7.32021 17.8191 27.9843 3.68571 50.8704 6.6131Z"
          fill="url(#mascot_heart_body)"
          fillOpacity="0.97"
        />
        <path
          d="M61.1592 27.5156C70.2437 27.5156 77.6084 34.8803 77.6084 43.9648C77.6083 53.0493 70.2436 60.414 61.1592 60.4141H33.0312C32.9844 60.4132 32.961 60.4141 32.9609 60.4141C23.4569 59.9858 16.5118 52.7868 16.5117 43.9648C16.5117 34.8803 23.8764 27.5156 32.9609 27.5156C38.9446 27.5157 44.1813 30.7112 47.0596 35.4883C49.9378 30.7109 55.1753 27.5156 61.1592 27.5156Z"
          fill="white"
        />
        <path
          d="M40.6387 52.3998L47.198 46.1855L53.7574 52.3998L47.198 60.4913L40.6387 52.3998Z"
          fill="#FBED68"
        />
        <path
          d="M28.1902 45.8204C27.0666 44.683 26.4877 43.3216 26.4707 41.7533C26.4877 39.5819 28.1732 37.7207 30.2843 37.7207C31.5101 37.7207 32.5827 38.2894 33.2637 39.1855C33.9787 38.2894 35.0343 37.7207 36.2601 37.7207C38.3711 37.7207 40.0736 39.5819 40.0736 41.7533C40.0736 43.3216 39.4948 44.683 38.3541 45.8204L34.3099 49.9005C33.7338 50.4817 32.7943 50.4809 32.2192 49.8988L28.1902 45.8204Z"
          fill="#FF3379"
        />
        <path
          d="M55.3953 45.8204C54.2717 44.683 53.6928 43.3216 53.6758 41.7533C53.6928 39.5819 55.3783 37.7207 57.4894 37.7207C58.7152 37.7207 59.7877 38.2894 60.4687 39.1855C61.1838 38.2894 62.2393 37.7207 63.4651 37.7207C65.5762 37.7207 67.2787 39.5819 67.2787 41.7533C67.2787 43.3216 66.6999 44.683 65.5592 45.8204L61.5149 49.9005C60.9389 50.4817 59.9994 50.4809 59.4243 49.8988L55.3953 45.8204Z"
          fill="#FF3379"
        />
        <path
          d="M78.0813 4.32509C77.6937 8.89191 76.9325 18.371 76.9876 19.7532L47.3696 27.1286L19.0861 15.6488C19.3356 14.2882 19.9191 4.79647 20.1797 0.220703C25.7489 1.31736 39.078 6.90076 47.8412 20.4616C58.4296 8.27248 72.413 4.62521 78.0813 4.32509Z"
          fill="url(#mascot_heart_brow)"
          fillOpacity="0.93"
        />
        <defs>
          <linearGradient
            id="mascot_heart_body"
            x1="32.2632"
            y1="4.23298"
            x2="72.7103"
            y2="117.219"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#48C281" />
            <stop offset="1" stopColor="#58D4C5" />
          </linearGradient>
          <radialGradient
            id="mascot_heart_brow"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(10.5744 20.366 -47.4411 24.6334 47.0609 20.4673)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#155848" />
            <stop offset="1" stopColor="#278655" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  if (emotion === "sad") {
    return (
      <svg
        {...common}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <path
          d="M54.5481 13.7459C77.4343 16.6734 93.8764 35.5532 91.2718 55.9152C90.1096 65.0012 85.3485 72.844 78.4015 78.4871L79.1102 89.756C79.1659 90.6423 78.2045 91.2277 77.4425 90.7713L67.4913 84.8121C60.7428 87.4568 53.0637 88.4996 45.1161 87.483C22.2301 84.5554 5.78881 65.6757 8.39336 45.3139C10.9979 24.952 31.662 10.8186 54.5481 13.7459Z"
          fill="url(#mascot_sad_body)"
          fillOpacity="0.97"
        />
        <path
          d="M64.835 34.6484C73.9195 34.6485 81.2842 42.0131 81.2842 51.0977C81.2841 60.0401 74.1479 67.3157 65.2598 67.541L64.835 67.5469H35.8535V67.5273C27.1326 67.1186 20.1876 59.9196 20.1875 51.0977C20.1875 42.0131 27.5522 34.6484 36.6367 34.6484C42.6204 34.6485 47.8571 37.844 50.7354 42.6211C53.6136 37.8437 58.8511 34.6484 64.835 34.6484Z"
          fill="white"
        />
        <path
          d="M44.3125 59.5326L50.8719 53.3184L57.4312 59.5326L50.8719 67.6242L44.3125 59.5326Z"
          fill="#FBED68"
        />
        {/* 감은 눈 */}
        <path d="M30.5 49C33 53.5 41.4 53.5 43.9 49" stroke="#242731" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path d="M57.9 49C60.4 53.5 68.8 53.5 71.3 49" stroke="#242731" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* 눈물 */}
        <path d="M75 48.5C77.3 51.8 78.4 53.9 78.4 55.7C78.4 57.6 76.9 59.2 75 59.2C73.1 59.2 71.6 57.6 71.6 55.7C71.6 53.9 72.7 51.8 75 48.5Z" fill="#9FEDFC" />
        <path
          d="M81.7571 11.4579C81.3695 16.0247 80.6083 25.5038 80.6634 26.886L51.0453 34.2614L22.7618 22.7816C23.0114 21.421 23.5949 11.9293 23.8555 7.35352C29.4247 8.45017 42.7538 14.0336 51.5169 27.5944C62.1053 15.4053 76.0888 11.758 81.7571 11.4579Z"
          fill="url(#mascot_sad_brow)"
          fillOpacity="0.93"
        />
        <defs>
          <linearGradient
            id="mascot_sad_body"
            x1="35.9412"
            y1="11.3658"
            x2="76.3879"
            y2="124.352"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#48C281" />
            <stop offset="1" stopColor="#58D4C5" />
          </linearGradient>
          <radialGradient
            id="mascot_sad_brow"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(10.5744 20.366 -47.4411 24.6334 50.7367 27.6001)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#155848" />
            <stop offset="1" stopColor="#278655" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  if (emotion === "working") {
    // 한쪽 눈 뜨고 윙크 + 식은땀 — "고민/미정" 표현. (Figma Mascot form=working)
    return (
      <svg
        {...common}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <path
          d="M54.5481 13.7459C77.4343 16.6734 93.8764 35.5532 91.2718 55.9152C90.1096 65.0012 85.3485 72.844 78.4015 78.4871L79.1102 89.756C79.1659 90.6423 78.2045 91.2277 77.4425 90.7713L67.4913 84.8121C60.7428 87.4568 53.0637 88.4996 45.1161 87.483C22.2301 84.5554 5.78881 65.6757 8.39336 45.3139C10.9979 24.952 31.662 10.8186 54.5481 13.7459Z"
          fill="url(#mascot_working_body)"
          fillOpacity="0.97"
        />
        <path
          d="M64.835 34.6484C73.9195 34.6485 81.2842 42.0131 81.2842 51.0977C81.2841 60.0401 74.1479 67.3157 65.2598 67.541L64.835 67.5469H35.8535V67.5273C27.1326 67.1186 20.1876 59.9196 20.1875 51.0977C20.1875 42.0131 27.5522 34.6484 36.6367 34.6484C42.6204 34.6485 47.8571 37.844 50.7354 42.6211C53.6136 37.8437 58.8511 34.6484 64.835 34.6484Z"
          fill="white"
        />
        <path
          d="M44.3125 59.5326L50.8719 53.3184L57.4312 59.5326L50.8719 67.6242L44.3125 59.5326Z"
          fill="#FBED68"
        />
        {/* 뜬 눈(왼쪽) */}
        <ellipse cx="37.2306" cy="50.9205" rx="5.98061" ry="6.02009" fill="#242731" />
        <ellipse cx="34.8591" cy="49.1734" rx="2.05441" ry="2.06797" fill="white" />
        {/* 윙크(오른쪽 감은 눈) */}
        <path d="M57.9 50.5C60.4 55 68.8 55 71.3 50.5" stroke="#242731" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* 식은땀 */}
        <path d="M77 49C79.1 51.9 80.1 53.8 80.1 55.5C80.1 57.3 78.7 58.7 77 58.7C75.3 58.7 73.9 57.3 73.9 55.5C73.9 53.8 74.9 51.9 77 49Z" fill="#C8F7FF" stroke="#4FC5C7" strokeWidth="0.8" />
        <path
          d="M81.7571 11.4579C81.3695 16.0247 80.6083 25.5038 80.6634 26.886L51.0453 34.2614L22.7618 22.7816C23.0114 21.421 23.5949 11.9293 23.8555 7.35352C29.4247 8.45017 42.7538 14.0336 51.5169 27.5944C62.1053 15.4053 76.0888 11.758 81.7571 11.4579Z"
          fill="url(#mascot_working_brow)"
          fillOpacity="0.93"
        />
        <defs>
          <linearGradient
            id="mascot_working_body"
            x1="35.9412"
            y1="11.3658"
            x2="76.3879"
            y2="124.352"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#48C281" />
            <stop offset="1" stopColor="#58D4C5" />
          </linearGradient>
          <radialGradient
            id="mascot_working_brow"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(10.5744 20.366 -47.4411 24.6334 50.7367 27.6001)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#155848" />
            <stop offset="1" stopColor="#278655" />
          </radialGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg
      {...common}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <path
        d="M54.5481 13.7459C77.4343 16.6734 93.8764 35.5532 91.2718 55.9152C90.1096 65.0012 85.3485 72.844 78.4015 78.4871L79.1102 89.756C79.1659 90.6423 78.2045 91.2277 77.4425 90.7713L67.4913 84.8121C60.7428 87.4568 53.0637 88.4996 45.1161 87.483C22.2301 84.5554 5.78881 65.6757 8.39336 45.3139C10.9979 24.952 31.662 10.8186 54.5481 13.7459Z"
        fill="url(#mascot_default_body)"
        fillOpacity="0.97"
      />
      <path
        d="M64.835 34.6484C73.9195 34.6485 81.2842 42.0131 81.2842 51.0977C81.2841 60.0401 74.1479 67.3157 65.2598 67.541L64.835 67.5469H35.8535V67.5273C27.1326 67.1186 20.1876 59.9196 20.1875 51.0977C20.1875 42.0131 27.5522 34.6484 36.6367 34.6484C42.6204 34.6485 47.8571 37.844 50.7354 42.6211C53.6136 37.8437 58.8511 34.6484 64.835 34.6484Z"
        fill="white"
      />
      <path
        d="M44.3125 59.5326L50.8719 53.3184L57.4312 59.5326L50.8719 67.6242L44.3125 59.5326Z"
        fill="#FBED68"
      />
      <ellipse cx="37.2306" cy="50.9205" rx="5.98061" ry="6.02009" fill="#242731" />
      <ellipse cx="34.8591" cy="49.1734" rx="2.05441" ry="2.06797" fill="white" />
      <ellipse cx="64.5158" cy="50.9205" rx="5.98061" ry="6.02009" fill="#242731" />
      <ellipse cx="62.1403" cy="49.1734" rx="2.05441" ry="2.06797" fill="white" />
      <path
        d="M81.7571 11.4579C81.3695 16.0247 80.6083 25.5038 80.6634 26.886L51.0453 34.2614L22.7618 22.7816C23.0114 21.421 23.5949 11.9293 23.8555 7.35352C29.4247 8.45017 42.7538 14.0336 51.5169 27.5944C62.1053 15.4053 76.0888 11.758 81.7571 11.4579Z"
        fill="url(#mascot_default_brow)"
        fillOpacity="0.93"
      />
      <defs>
        <linearGradient
          id="mascot_default_body"
          x1="35.9412"
          y1="11.3658"
          x2="76.3879"
          y2="124.352"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#48C281" />
          <stop offset="1" stopColor="#58D4C5" />
        </linearGradient>
        <radialGradient
          id="mascot_default_brow"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(10.5744 20.366 -47.4411 24.6334 50.7367 27.6001)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#155848" />
          <stop offset="1" stopColor="#278655" />
        </radialGradient>
      </defs>
    </svg>
  );
}
