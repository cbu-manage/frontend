"use client";
import { useMemo, useState } from "react";

type Member = {
  id: number;
  name: string;
  studentId: string;
  nickName: string;
  email: string;
  batch: string;
  paymentStatus: boolean;
  activityStatus: string;
};

const STATUSES = ["활동", "중단", "탈퇴"] as const;

export default function MemberManagePage() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [batchFilter, setBatchFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const batchList = useMemo(() => Array.from({ length: 20 }, (_, i) => `${i + 1}기`), []);

  const data = useMemo<Member[]>(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: `회원 ${i + 1}`,
        studentId: `20191${Math.floor(10000 + Math.random() * 89999)}`,
        nickName: `닉네임 ${i + 1}`,
        email: `user${i + 1}@tukorea.ac.kr`,
        batch: `${Math.floor(1 + Math.random() * 20)}기`,
        paymentStatus: Math.random() > 0.5,
        activityStatus: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      })),
    []
  );

  const filteredData = useMemo(() => {
    if (batchFilter) return data.filter((d) => d.batch === batchFilter);
    return data;
  }, [data, batchFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage]);

  const isEntireSelected = selectedItems.length === paginatedData.length && paginatedData.length > 0;

  const entireSelectToggle = () => {
    if (isEntireSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((i) => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filterByBatch = (batch: string) => {
    setBatchFilter(batch);
    setCurrentPage(1);
    setDropdownVisible(false);
    window.scrollTo(0, 0);
  };

  const resetFilter = () => {
    setBatchFilter(null);
    setCurrentPage(1);
    setDropdownVisible(false);
    window.scrollTo(0, 0);
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-lg">전체 동아리 회원 <span className="font-semibold">{data.length}명</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
            <img src="/assets/download.svg" alt="다운로드 아이콘" />
            스프레드 시트 연동하기
          </button>
          <div className="relative">
            <button
              onClick={() => setDropdownVisible((v) => !v)}
              className="rounded-md border px-3 py-2"
            >
              {batchFilter ?? "기수"}
            </button>
            {dropdownVisible && (
              <ul className="absolute right-0 z-10 mt-1 w-32 rounded-md border bg-white shadow">
                <li className="px-3 py-2 cursor-pointer hover:bg-zinc-50" onClick={resetFilter}>전체</li>
                {batchList.map((b) => (
                  <li key={b} className="px-3 py-2 cursor-pointer hover:bg-zinc-50" onClick={() => filterByBatch(b)}>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            <img src="/assets/search.svg" alt="검색 아이콘" />
            <input className="outline-none" type="text" placeholder="이름을 검색하세요." />
          </div>
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="p-2">
                <button
                  className={`h-5 w-5 rounded border ${isEntireSelected ? 'bg-zinc-900' : 'bg-white'}`}
                  onClick={entireSelectToggle}
                  aria-label="select all"
                />
              </th>
              <th className="p-2 text-left">기수</th>
              <th className="p-2 text-left">이름</th>
              <th className="p-2 text-left">학번</th>
              <th className="p-2 text-left">닉네임</th>
              <th className="p-2 text-left">메일 주소</th>
              <th className="p-2 text-left">입금 상태</th>
              <th className="p-2 text-left">활동 여부</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className={`${selectedItems.includes(item.id) ? 'bg-zinc-50' : ''}`}>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="p-2">{item.batch}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.studentId}</td>
                <td className="p-2">{item.nickName}</td>
                <td className="p-2">{item.email}</td>
                <td className={`p-2 ${item.paymentStatus ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.paymentStatus ? '입금' : '미입금'}
                </td>
                <td className="p-2">{item.activityStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2">활동 상태 변경</button>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2">디스코드 일괄 초대링크 발송</button>
          <button className="rounded-md bg-zinc-900 text-white px-3 py-2">입금 상태 변경</button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          className="rounded-md border px-3 py-1"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          이전
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button
          className="rounded-md border px-3 py-1"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          다음
        </button>
      </div>
    </main>
  );
}


