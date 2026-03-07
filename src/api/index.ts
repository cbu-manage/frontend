export { api } from "./client";

// Auth
export {
  authApi,
  type LoginRequest,
  type LoginResponse,
  type SignupRequest,
  type ChangePasswordRequest,
} from "./auth.api";

// Mail
export { mailApi, type MailSendResponse, type MailVerifyResponse, type MailUpdateRequest } from "./mail.api";

// User
export { userApi, type UserInfo, type VerifyUserRequest } from "./user.api";

// Study
export { studyApi, type StudyListParams } from "./study.api";

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
  type ProjectFilterParams,
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
export { reportApi, type ReportListParams } from "./report.api";

// Comment
export { commentApi } from "./comment.api";

// Group
export { groupApi } from "./group.api";

// Post (공통)
export {
  postApi,
  POST_CATEGORY,
  type PostListParams,
  type PostListItem,
  type PostListResponse,
} from "./post.api";

// Image
export { imageApi } from "./image.api";
