// API base URL from Next public env
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL as string)
    : '/api/v1';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/login/signup`,
  MAIL_SEND: `${API_BASE_URL}/mail/send`,
  MAIL_VERIFY: `${API_BASE_URL}/mail/verify`,
  MAIL_UPDATE: `${API_BASE_URL}/mail/update`,
  VERIFY_USER: `${API_BASE_URL}/verify`,
  CHANGE_PASSWORD: `${API_BASE_URL}/change-password`,
  CHANGE_PASSWORD_PATCH: `${API_BASE_URL}/login/password`,
} as const;


