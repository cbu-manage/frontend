import { api } from "./client";

export type MemberInfo = {
  id: number;
  role: string; // 서버 MemberDTO.role (단수 문자열, 예: "ROLE_USER")
  name: string;
  phoneNumber: string;
  major: string;
  grade: string;
  studentNumber: number;
  generation: number;
  note: string;
  due: boolean;
  email: string;
};

export type MembersResponse = {
  code: string;
  message: string;
  data: {
    totalElements: number;
    totalPages: number;
    size: number;
    content: MemberInfo[];
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

/** PATCH /member 바디 (MemberUpdateDTO) — 운영진 role 부여·회원 정보 수정 */
export type MemberUpdateDTO = {
  userId: number;
  role?: string;
  name?: string;
  phoneNumber?: string;
  major?: string;
  grade?: string;
  studentNumber?: number;
  generation?: number;
  note?: string;
  kakaoNoti?: string;
  kakaoChat?: string;
};

export const memberApi = {
  getById: (id: number) => api.get<MemberInfo>(`/member/${id}`),

  // 주의: 서버 GET /members 는 page 파라미터만 받음 (size·검색 미지원)
  getAll: (page = 0, size = 10) =>
    api.get<MembersResponse>("/members", { params: { page, size } }),

  /** 회원 정보 수정 — 운영진 role 부여 포함 (PATCH /member, 전체 DTO) */
  update: (dto: MemberUpdateDTO) => api.patch("/member", dto),

  /** 회비 납부 승인 (단방향 — 취소 엔드포인트 없음) */
  approvePayment: (id: number) => api.patch(`/member/${id}/approve-payment`),

  /** 회원 삭제 (학번 기준) */
  remove: (studentNumber: number) => api.delete(`/member/${studentNumber}`),
};
