/**
 * Standardized API & Domain Error Codes
 */

export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AST_PARSING_ERROR = 'AST_PARSING_ERROR',
  GRAPH_QUERY_ERROR = 'GRAPH_QUERY_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export interface ApiErrorDetails {
  code: ErrorCode | string;
  message: string;
  statusCode?: number;
  details?: unknown;
  requestId?: string;
  timestamp?: string;
}

export class ApiError extends Error {
  public readonly code: ErrorCode | string;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly requestId?: string;
  public readonly timestamp: string;

  constructor(params: ApiErrorDetails) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.statusCode = params.statusCode ?? 500;
    this.details = params.details;
    this.requestId = params.requestId;
    this.timestamp = params.timestamp ?? new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): { error: ApiErrorDetails } {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        requestId: this.requestId ?? 'unknown',
        timestamp: this.timestamp,
      },
    };
  }
}
