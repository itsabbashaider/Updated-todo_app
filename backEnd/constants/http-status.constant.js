// ─── HTTP Status Constants ───────────────────────────────────────────────

const HTTP_STATUSES = {
  // 2xx Success Responses
  OK: 200,                    // Request succeeded
  CREATED: 201,               // Resource created successfully
  ACCEPTED: 202,              // Request accepted for processing
  NO_CONTENT: 204,            // Request succeeded, no content to return

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Errors
  BAD_REQUEST: 400,           // Malformed request syntax
  UNAUTHORIZED: 401,          // Authentication required
  FORBIDDEN: 403,             // Authenticated but not authorized
  NOT_FOUND: 404,             // Resource not found
  CONFLICT: 409,              // Request conflicts with existing data
  UNPROCESSABLE_ENTITY: 422,  // Request is well-formed but semantically incorrect

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// ─── Export as Named Constant ────────────────────────────────────────────
module.exports = HTTP_STATUSES;
