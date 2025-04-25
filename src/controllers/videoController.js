const cloudinary = require('../utils/cloudinary');

// Upload videos and return URLs
exports.uploadVideos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(file.path, {
          resource_type: "video",
          folder: "videos",
          chunk_size: 6000000, // 6MB chunks for better upload
          eager: [
            { format: "mp4", quality: "auto" }
          ],
          eager_async: true
        }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    });

    const results = await Promise.all(uploadPromises);
    
    // Extract relevant information from results
    const videos = results.map(result => ({
      url: result.secure_url,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
      size: result.bytes
    }));

    res.status(200).json({
      message: 'Videos uploaded successfully',
      videos
    });
  } catch (error) {
    console.error('Error uploading videos:', error);
    res.status(500).json({ 
      message: 'Error uploading videos',
      error: error.message 
    });
  }
};

// Upload single video and return URL
exports.uploadSingleVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(req.file.path, {
        resource_type: "video",
        folder: "videos",
        chunk_size: 6000000, // 6MB chunks for better upload
        eager: [
          { format: "mp4", quality: "auto" }
        ],
        eager_async: true
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    res.status(200).json({
      message: 'Video uploaded successfully',
      video: {
        url: result.secure_url,
        public_id: result.public_id,
        duration: result.duration,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ 
      message: 'Error uploading video',
      error: error.message 
    });
  }
};

// Delete video from Cloudinary
exports.deleteVideo = async (req, res) => {
  try {
    const { public_id } = req.params;
    
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: "video"
    });

    if (result.result === 'not found') {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json({
      message: 'Video deleted successfully',
      result
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      message: 'Error deleting video',
      error: error.message
    });
  }
}; 