const multer= require('multer');
const path = require('path');

//configure
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'upload/');
    },
    filename: function (req, file, cb) {

      cb(null,Date.now()+path.extname(file.originalname));
    }
  });

// Security: the old configuration accepted any file type at any size.
// The upload middleware is not wired into any route today, but
// express.static serves the upload/ directory, so an uploaded .html
// file would be served back from the backend origin as stored XSS.
// Images only, 5 MB max — defence in depth for the day upload is
// wired in. Filenames stay Date.now() + the original extension, so
// no user input reaches the filesystem path.
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

const fileFilter = function (req, file, cb) {
  if (IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, gif, webp) are allowed"), false);
  }
};

  const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  module.exports = upload;
