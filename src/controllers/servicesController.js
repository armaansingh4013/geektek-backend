const fs = require('fs');
const path = require('path');
const Service = require('../models/Services');
const cloudinary = require('../utils/cloudinary');

// 1. Get list of service names and IDs
exports.getServiceNames = async (req, res) => {
  try {
    const services = await Service.find({}, '_id name');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get images array from service ID
exports.getServiceImages = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service.images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Create a new service
exports.createService = async (req, res) => {
  try {
    const { name, images } = req.body;
    const service = new Service({ name, images });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};

// 4. Update images for a service

exports.updateService = async (req, res) => {
  try {
    const { name, addImages = [], removeImages = [] } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Update name if provided
    if (name) {
      service.name = name;
    }

    // Add new images
    if (Array.isArray(addImages) && addImages.length > 0) {
      service.images.push(...addImages);
    }

    // Remove specified images
    // if (Array.isArray(removeImages) && removeImages.length > 0) {
    //   removeImages.forEach((img) => {
    //     // Remove from DB array
    //     const index = service.images.indexOf(img);
    //     if (index > -1) service.images.splice(index, 1);

    //     // Delete image from uploads folder
    //     const filePath = path.join(__dirname, '../uploads', path.basename(img));
    //     if (fs.existsSync(filePath)) {
    //       fs.unlinkSync(filePath);
    //     }
    //   });
    // }
    if (Array.isArray(removeImages) && removeImages.length > 0) {
      removeImages.forEach(async (imgUrl) => {
        const imageIndex = service.images.findIndex((imgObj) => imgObj.imageUrl === imgUrl.imageUrl);

        if (imageIndex > -1) {
          const publicId = service.images[imageIndex].public_id;
    
          // Remove from DB array
          service.images.splice(imageIndex, 1);
    
    
        // Delete from Cloudinary
        try {
          await cloudinary.uploader.destroy(imgUrl.public_id);
          console.log(`Deleted from Cloudinary: ${imgUrl.public_id}`);
        } catch (err) {
          console.error(`Failed to delete ${imgUrl.public_id}`, err);
        }
      }
      });
    }

    await service.save();
    res.status(200).json(service);
  } catch (err) {
    console.log('====================================');
    console.log(err);
    console.log('====================================');
    res.status(500).json({ error: err.message });
  }
};


// 5. Delete service and its images from server
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Delete images from Cloudinary
    for (const imgObj of service.images) {
      try {
        await cloudinary.uploader.destroy(imgObj.public_id);
        console.log(`Deleted from Cloudinary: ${imgObj.public_id}`);
      } catch (err) {
        console.error(`Failed to delete ${imgObj.public_id}`, err);
      }
    }

    await service.deleteOne();
    res.json({ message: 'Service and images deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({}, 'name images'); // only select name and images
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
