// Shared list pagination for the P0 perf patch.
//
// ?page (default 1) and ?limit (default 20, capped at 50). parsePagination
// returns safe integers, so ?page=abc or ?limit=9999 can never produce a
// broken LIMIT / OFFSET. Every paginated list endpoint returns
// { data, total, page, limit } via paginatedResponse.

function parsePagination(req) {
  const rawPage = Number.parseInt(req.query.page, 10);
  const rawLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(rawLimit, 50) : 20;
  return { page, limit, offset: (page - 1) * limit };
}

function paginatedResponse(rows, total, { page, limit }) {
  return { data: rows, total, page, limit };
}

module.exports = { parsePagination, paginatedResponse };
