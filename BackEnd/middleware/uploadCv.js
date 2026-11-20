const multer = require("multer");

// CV (PDF) upload for job applications.
//
// Why memory storage, not disk: the backend runs on Vercel serverless,
// where the filesystem is ephemeral — a file written to disk in one
// invocation is gone in the next, so the old disk-based upload
// middleware could never serve a CV back. The PDF is stored as a
// MEDIUMBLOB in the qualifications row instead (see migration
// 002-add-cv-columns.sql); the database is the only durable storage
// this deployment already has. Trade-off, stated plainly: a 5 MB cap
// keeps rows small, but a high-volume production app should move CVs
// to object storage (S3 / Cloudinary / ...) instead of the database.
//
// Slowness handling: the file is validated BEFORE it is buffered —
// multer's fileFilter rejects non-PDFs from the stream, and
// limits.fileSize aborts an oversized upload mid-stream instead of
// reading all of it first. The client also validates type / size /
// magic bytes before sending, so an invalid file never starts a slow
// upload.
const MAX_CV_SIZE = 5 * 1024 * 1024; // 5 MB

const fileFilter = (req, file, cb) => {
  // Browsers send application/pdf for .pdf files. The magic-byte check
  // (%PDF-) in the route is the real verification — the mimetype header
  // is client-controlled and can be spoofed.
  if (file.mimetype === "application/pdf") {
    return cb(null, true);
  }
  return cb(new Error("Only PDF files are allowed for the CV"), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: MAX_CV_SIZE, files: 1 },
});

// Wraps upload.single("cv") and maps multer errors to the status codes
// the client can act on, instead of letting them fall through to the
// generic 500 handler: 413 when the file is over the size limit, 400
// for a wrong file type. A missing file is NOT an error — the CV is
// optional on an application.
const handleUploadCv = (req, res, next) => {
  upload.single("cv")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        status: "error",
        message: "CV is too large — the maximum size is 5 MB.",
      });
    }
    return res.status(400).json({ status: "error", message: err.message });
  });
};

module.exports = { handleUploadCv, MAX_CV_SIZE };
