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
} from "./project.api";

// Coding Test
export { codingTestApi, type ProblemListParams } from "./codingTest.api";

// Report
export { reportApi, type ReportListParams } from "./report.api";

// Comment
export { commentApi } from "./comment.api";

// Group
export { groupApi } from "./group.api";

// Post (공통)
export { postApi, type PostListParams } from "./post.api";

// Image
export { imageApi } from "./image.api";
