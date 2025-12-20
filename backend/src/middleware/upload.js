const multer = require("multer");
const { uploadBuffer } = require("../services/fileStorage");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * Express middleware that uploads a single image file to local file system
 * and attaches the public URL to req.fileUrl.
 */
function uploadImage(fieldName) {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      if (!req.file) return next();
      try {
        const url = await uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
        req.fileUrl = url;
        return next();
      } catch (err) {
        return next(err);
      }
    },
  ];
}

module.exports = {
  uploadImage,
};


