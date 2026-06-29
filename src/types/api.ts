// Generic API response wrappers

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export class ApiException extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiException";
  }
}
