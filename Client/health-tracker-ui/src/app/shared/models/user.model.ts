export interface User {
  userId: number;
  username: string;
  email: string;
  timeZoneId?: string;
  createdAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  timeZoneId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
  requiresVerification?: boolean;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
}

export interface ValidateResetTokenRequest {
  token: string;
  email: string;
}

export interface MessageResponse {
  message: string;
}
