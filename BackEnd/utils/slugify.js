// URL slugs for jobs: "Full-Stack Developer (MERN)" becomes
// "full-stack-developer-mern", so job-details URLs are readable
// (/full-stack-developer-mern) instead of numeric ids.
// generateUniqueSlug appends -2, -3, ... while a slug is taken, so
// two jobs with the same title never collide (jobs.slug is UNIQUE).

function slugify(text) {
  const slug = String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
  return slug || "job";
}

// `query` is the promisified pool.query (same one the routes use).
// `excludeId` skips the job being updated, so re-saving a job keeps
// its own slug instead of colliding with itself.
async function generateUniqueSlug(query, baseSlug, excludeId) {
  const base = baseSlug || "job";
  let slug = base;
  let suffix = 2;
  for (;;) {
    const rows = excludeId
      ? await query("select id from jobs where slug = ? and id != ?", [slug, excludeId])
      : await query("select id from jobs where slug = ?", [slug]);
    if (!rows[0]) return slug;
    slug = base + "-" + suffix;
    suffix += 1;
  }
}

module.exports = { slugify, generateUniqueSlug };
