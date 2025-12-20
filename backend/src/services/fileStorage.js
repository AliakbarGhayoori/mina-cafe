const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

/**
 * Simple file system storage for uploaded images.
 * Files are saved to the uploads directory and served via Express static middleware.
 */

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";

// Ensure uploads directory exists
async function ensureUploadsDir() {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
}

/**
 * Upload a file buffer to the local file system
 * @param {Buffer} fileBuffer - The file buffer to save
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Public URL of the uploaded file
 */
async function uploadBuffer(fileBuffer, originalName, mimeType) {
  await ensureUploadsDir();

  // Generate unique filename
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "bin";
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(6).toString("hex");
  const filename = `${timestamp}-${randomString}.${ext}`;
  const filePath = path.join(uploadsDir, filename);

  // Save file to disk
  await fs.writeFile(filePath, fileBuffer);

  // Return public URL
  const publicUrl = `${baseUrl}/uploads/${filename}`;
  return publicUrl;
}

module.exports = {
  uploadBuffer,
};

