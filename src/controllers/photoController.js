const path = require('path');

// // Upload photos and return paths
// exports.uploadPhotos = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded' });
//     }

//     // Get array of file paths
//     const filePaths = req.files.map(file => {
//       // Convert backslashes to forward slashes for consistency
//       return file.path.replace(/\\/g, '/');
//     });

//     res.status(200).json({
//       message: 'Files uploaded successfully',
//       paths: filePaths
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Error uploading files',
//       error: error.message 
//     });
//   }
// };

// // Upload single photo and return path
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

const fs = require('fs');
const cloudinary = require('../utils/cloudinary');

exports.uploadPhotos = async (req, res) => {
  console.log('====================================');
  console.log("req.files", req);
  console.log('====================================');
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
console.log("recieved");

    // Helper to upload a buffer to Cloudinary
    const uploadToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'crystaloak' },
          (error, result) => {
            if (error) return reject(error);
            resolve({
              imageUrl: result.secure_url,
              public_id: result.public_id,
            });
          }
        );
        stream.end(fileBuffer);
      });
    };

    // Upload all files in parallel from buffer
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
    const uploadedImages = await Promise.all(uploadPromises);
console.log("uploaded");

    res.status(200).json({
      success: true,
      paths: uploadedImages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
};

