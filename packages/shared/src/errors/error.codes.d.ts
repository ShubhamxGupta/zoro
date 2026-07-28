/**
 * Standardized API & Domain Error Codes
 */
export declare enum ErrorCode {
    NOT_FOUND = "NOT_FOUND",
    BAD_REQUEST = "BAD_REQUEST",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    CONFIG_ERROR = "CONFIG_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    AST_PARSING_ERROR = "AST_PARSING_ERROR",
    GRAPH_QUERY_ERROR = "GRAPH_QUERY_ERROR",
    PROVIDER_ERROR = "PROVIDER_ERROR"
}
export interface ApiErrorDetails {
    code: ErrorCode | string;
    message: string;
    statusCode?: number;
    details?: unknown;
    requestId?: string;
    timestamp?: string;
}
export declare class ApiError extends Error {
    readonly code: ErrorCode | string;
    readonly statusCode: number;
    readonly details?: unknown;
    readonly requestId?: string;
    readonly timestamp: string;
    constructor(params: ApiErrorDetails);
    toJSON(): {
        error: ApiErrorDetails;
    };
}
//# sourceMappingURL=error.codes.d.ts.map