const path = require('path');

// Upload photos and return paths
exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Get array of file paths
    const filePaths = req.files.map(file => {
      // Convert backslashes to forward slashes for consistency
      return file.path.replace(/\\/g, '/');
    });

    res.status(200).json({
      message: 'Files uploaded successfully',
      paths: filePaths
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error uploading files',
      error: error.message 
    });
  }
};

// Upload single photo and return path
exports.uploadSinglePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path.replace(/\\/g, '/');

    res.status(200).json({
      message: 'File uploaded successfully',
      path: filePath
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error uploading file',
      error: error.message 
    });
  }
}; 