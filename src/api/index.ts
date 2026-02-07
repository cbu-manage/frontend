export { api } from "./client";
export { authApi, type LoginRequest, type LoginResponse, type SignupRequest, type ChangePasswordRequest } from "./auth.api";
export { mailApi, type MailSendResponse, type MailVerifyResponse, type MailUpdateRequest } from "./mail.api";
export { userApi, type UserInfo, type VerifyUserRequest } from "./user.api";
