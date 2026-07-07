export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}
