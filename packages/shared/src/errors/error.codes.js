/**
 * Standardized API & Domain Error Codes
 */
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["CONFIG_ERROR"] = "CONFIG_ERROR";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["AST_PARSING_ERROR"] = "AST_PARSING_ERROR";
    ErrorCode["GRAPH_QUERY_ERROR"] = "GRAPH_QUERY_ERROR";
    ErrorCode["PROVIDER_ERROR"] = "PROVIDER_ERROR";
})(ErrorCode || (ErrorCode = {}));
export class ApiError extends Error {
    code;
    statusCode;
    details;
    requestId;
    timestamp;
    constructor(params) {
        super(params.message);
        this.name = 'ApiError';
        this.code = params.code;
        this.statusCode = params.statusCode ?? 500;
        this.details = params.details;
        this.requestId = params.requestId;
        this.timestamp = params.timestamp ?? new Date().toISOString();
        Object.setPrototypeOf(this, new.target.prototype);
    }
    toJSON() {
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
//# sourceMappingURL=error.codes.js.map