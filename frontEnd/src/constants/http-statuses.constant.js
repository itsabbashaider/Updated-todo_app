const HTTP_STATUSES = {

  // ─── Success ─────────────────────────────────────────────────────────────────
  OK      : 200,
  CREATED : 201,

  // ─── Client Errors ───────────────────────────────────────────────────────────
  BAD_REQUEST  : 400,
  UNAUTHORIZED : 401,
  FORBIDDEN    : 403,
  NOT_FOUND    : 404,

  // ─── Server Errors ───────────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR: 500,

};

export default HTTP_STATUSES;