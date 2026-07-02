export { api } from "./client";

// Auth
export {
  authApi,
  type LoginRequest,
  type LoginResponse,
  type SignupRequest,
  type ChangePasswordRequest,
  type ResetPasswordRequest,
} from "./auth.api";

// Mail
export { mailApi, type MailUpdateRequest } from "./mail.api";

// User
export { userApi, type UserInfo, type ValidateUserRequest } from "./user.api";

// Study
export {
  studyApi,
  type StudyListParams,
  type StudyMyListParams,
} from "./study.api";

// Resources (자료방)
export {
  resourcesApi,
  type ResourceListParams,
  type ResourceItem,
  type ResourceListResponse,
} from "./resources.api";

// Project
export {
  projectApi,
  type ProjectListParams,
  type ProjectListItem,
  type ProjectListResponse,
  type ProjectDetailData,
  type CreateProjectRequest,
  type UpdateProjectRequest,
} from "./project.api";

// Coding Test
export {
  codingTestApi,
  type ProblemListParams,
  type ProblemListItem,
  type ProblemListResponse,
  type PlatformItem,
  type LanguageItem,
  type CategoryItem,
  type CreateProblemRequest,
  type UpdateProblemRequest,
} from "./codingTest.api";

// Report
export {
  reportApi,
  type ReportListParams,
  type ReportPreviewItem,
  type ReportPreviewPage,
  type ReportDetail,
  type ReportMember,
} from "./report.api";

// Comment
export { commentApi, extractCommentList } from "./comment.api";
export type { CommentItem, CommentBody } from "./comment.api";

// Group
export {
  groupApi,
  type MyGroupItem,
  type GroupMemberItem,
  type GroupDetailData,
  type GroupMemberDetail,
} from "./group.api";

// Post (공통)
export {
  postApi,
  POST_CATEGORY,
  type PostListParams,
  type PostListItem,
  type PostListResponse,
} from "./post.api";

// Member
export { memberApi, type MemberInfo, type MemberUpdateDTO } from "./member.api";

// Applicant (신입 부원 신청서 — 모집 기반)
export {
  applicantApi,
  recruitmentApi,
  type VoteDecision,
  type FinalDecision,
  type ApplicationTab,
  type ApplicationField,
  type Recruitment,
  type ApplicationListItem,
  type ApplicationListResponse,
  type ApplicationListParams,
  type ApplicationDetail,
  type ApplicantInfo,
  type AnswerItem,
  type PortfolioItem,
  type VoteItem,
  type MyVote,
  type FinalizeDecision,
  type Page,
} from "./applicant.api";

// Gathering (모임 일정)
export {
  gatheringApi,
  GATHERING_TYPE_LABEL,
  type GatheringType,
  type MyAttendanceStatus,
  // VoteDecision("PASS"|"FAIL")은 applicant.api 재export와 동일 → 중복 제거(모임도 그걸 사용)
  type AttendanceSummary,
  type Gathering,
  type GatheringMember,
  type AdminGatheringMember,
  type AttendanceList,
  type AdminAttendanceList,
  type CreateGatheringBody,
  type UpdateGatheringBody,
} from "./gathering.api";

// Image
export { imageApi } from "./image.api";

// Apply
export { applyApi, type ApplicationRequest } from "./apply.api";

// News (공지·뉴스레터)
export {
  newsApi,
  type NewsCategory,
  type NewsletterType,
  type NewsListParams,
  type NewsListItem,
  type NewsListResponse,
  type NewsDetail,
  type NewsAttachment,
  type NewsCreateBody,
  type NewsUpdateBody,
  type AttachmentDownload,
  type PageInfo,
  type NewsSearchInfo,
} from "./news.api";

// Settings
export { settingsApi, type OnboardingLinks } from "./settings.api";

// Free Board
export {
  freeboardApi,
  freeboardAuthorLabel,
  type FreeBoardCreateBody,
  type FreeBoardUpdateBody,
  type FreeBoardListItem,
  type FreeBoardListResponse,
  type FreeBoardPost,
} from "./freeboard.api";
