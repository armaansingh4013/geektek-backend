const fs = require('fs').promises;
const path = require('path');

// Delete file if it exists
exports.deleteFile = async (filePath) => {
  try {
    if (!filePath) return;

    // Convert relative path to absolute path if needed
    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(process.cwd(), filePath);

    // Check if file exists before attempting to delete
    await fs.access(absolutePath);
    await fs.unlink(absolutePath);
    return true;
  } catch (error) {
    // If file doesn't exist or other error, just log it
    console.error('Error deleting file:', error.message);
    return false;
  }
}; 