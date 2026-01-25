"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const footerInfo = [
    { title: "소속", name: "한국공학대학교" },
    { title: "문의", name: "ray@tukorea.ac.kr" },
  ];
  // 소셜 링크 정보(간단하게)
  const socialLinks = [
    { name: "인스타그램", url: "https://www.instagram.com/tukorea_cbu", icon: "/assets/instagram.svg" },
    { name: "깃허브", url: "https://github.com/C-B-U/TUK-cbu-manage", icon: "/assets/github.svg" },
  ];

  return (
    <footer className="w-full py-9 bg-gray-0">
      <div className="px-[9.375%] flex flex-col gap-6">
      <div className="flex justify-center">
        <Link href="/">
          <Image 
            src="/assets/logo.png" 
            alt="로고 이미지" 
            width={100} 
            height={100}
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        {footerInfo.map((info, idx) => (
          <p key={idx} className="text-center text-sm text-gray-800">
            {info.title} ㅣ {info.name}
          </p>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-4 justify-center">
          {socialLinks.map((link, idx) => (
            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
              <Image src={link.icon} alt={link.name} width={24} height={24} />
            </a>
          ))}
        </div>
        <hr className="w-full border-none h-px bg-gray-0" />
        <p className="text-xs text-[#CCC]">Copyright ⓒ 2025 씨부엉 All rights reserved.</p>
      </div>
      </div>
    </footer>
  );
}

