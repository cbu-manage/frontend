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

export default function MemberManageSection() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [batchFilter, setBatchFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const batchList = useMemo(
    () => Array.from({ length: 20 }, (_, i) => `${i + 1}기`),
    [],
  );

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
    [],
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

  const isEntireSelected =
    selectedItems.length === paginatedData.length && paginatedData.length > 0;

  const entireSelectToggle = () => {
    if (isEntireSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map((i) => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filterByBatch = (batch: string) => {
    setBatchFilter(batch);
    setCurrentPage(1);
    setDropdownVisible(false);
  };

  const resetFilter = () => {
    setBatchFilter(null);
    setCurrentPage(1);
    setDropdownVisible(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        회원 관리
      </h1>

      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-lg">
          전체 동아리 회원{" "}
          <span className="font-semibold">{data.length}명</span>
        </p>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
            스프레드 시트 연동하기
          </button>
          <div className="relative">
            <button
              onClick={() => setDropdownVisible((v) => !v)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              {batchFilter ?? "기수"}
            </button>
            {dropdownVisible && (
              <ul className="absolute right-0 z-10 mt-1 w-32 rounded-md border bg-white shadow-lg max-h-60 overflow-y-auto">
                <li
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                  onClick={resetFilter}
                >
                  전체
                </li>
                {batchList.map((b) => (
                  <li
                    key={b}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                    onClick={() => filterByBatch(b)}
                  >
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-md border px-3 py-2">
            <input
              className="outline-none text-sm"
              type="text"
              placeholder="이름을 검색하세요."
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">
                <button
                  className={`h-5 w-5 rounded border ${isEntireSelected ? "bg-gray-900" : "bg-white"}`}
                  onClick={entireSelectToggle}
                  aria-label="select all"
                />
              </th>
              <th className="p-3 text-left font-medium text-gray-700">기수</th>
              <th className="p-3 text-left font-medium text-gray-700">이름</th>
              <th className="p-3 text-left font-medium text-gray-700">학번</th>
              <th className="p-3 text-left font-medium text-gray-700">
                닉네임
              </th>
              <th className="p-3 text-left font-medium text-gray-700">
                메일 주소
              </th>
              <th className="p-3 text-left font-medium text-gray-700">
                입금 상태
              </th>
              <th className="p-3 text-left font-medium text-gray-700">
                활동 여부
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className={`transition-colors ${selectedItems.includes(item.id) ? "bg-gray-50" : "hover:bg-gray-50/50"}`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="p-3">{item.batch}</td>
                <td className="p-3 font-medium">{item.name}</td>
                <td className="p-3">{item.studentId}</td>
                <td className="p-3">{item.nickName}</td>
                <td className="p-3">{item.email}</td>
                <td
                  className={`p-3 font-medium ${item.paymentStatus ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {item.paymentStatus ? "입금" : "미입금"}
                </td>
                <td className="p-3">{item.activityStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
            활동 상태 변경
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
            디스코드 일괄 초대링크 발송
          </button>
          <button className="rounded-md bg-gray-900 text-white px-3 py-2 text-sm hover:opacity-90 transition-opacity">
            입금 상태 변경
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          이전
        </button>
        <span className="text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>
        <button
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          다음
        </button>
      </div>
    </div>
  );
}
