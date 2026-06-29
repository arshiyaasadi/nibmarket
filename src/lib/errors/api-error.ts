export interface AppError {
  code: "API_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "UNKNOWN" | "NETWORK_ERROR";
  message: string;
  status?: number;
}
