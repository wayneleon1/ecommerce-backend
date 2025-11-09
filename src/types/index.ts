export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  object?: T;
  errors?: string[] | null;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  object: T[];
  pageNumber: number;
  pageSize: number;
  totalSize: number;
  errors?: string[] | null;
}

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}
