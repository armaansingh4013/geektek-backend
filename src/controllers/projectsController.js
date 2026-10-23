const fs = require('fs');
const path = require('path');
const Project = require('../models/Projects');
const cloudinary = require('../utils/cloudinary');

// 1. Get list of Project names and IDs
exports.getProjectNames = async (req, res) => {
  try {
    const Projects = await Project.find({}, '_id name');
    res.json(Projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Get images array from Project ID
exports.getProjectImages = async (req, res) => {
  try {
    const Project = await Project.findById(req.params.id);
    if (!Project) return res.status(404).json({ error: 'Project not found' });
    res.json(Project.images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Create a new Project
exports.createProject = async (req, res) => {
  try {
    const { name,description, images,service } = req.body;
    const project = new Project({ name,description, images ,service});
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};

// 4. Update images for a Project

exports.updateProject = async (req, res) => {
  try {
    const { name, addImages = [], removeImages = [] ,description,address,service} = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Update name if provided
    if (name) {
      project.name = name;
    }


    // Update description if provided
    if (description) {
      project.description = description;
    }

    // Update address if provided
    if (address) {
      project.address = address;
    }

    // Update service if provided
    if (service) {
      project.service = service;
    }           
    // Add new images
    if (Array.isArray(addImages) && addImages.length > 0) {
      project.images.push(...addImages);
    }

    // Remove specified images
    // if (Array.isArray(removeImages) && removeImages.length > 0) {
    //   removeImages.forEach((img) => {
    //     // Remove from DB array
    //     const index = Project.images.indexOf(img);
    //     if (index > -1) Project.images.splice(index, 1);

    //     // Delete image from uploads folder
    //     const filePath = path.join(__dirname, '../uploads', path.basename(img));
    //     if (fs.existsSync(filePath)) {
    //       fs.unlinkSync(filePath);
    //     }
    //   });
    // }
    if (Array.isArray(removeImages) && removeImages.length > 0) {
      removeImages.forEach(async (imgUrl) => {
        const imageIndex = project.images.findIndex((imgObj) => imgObj.imageUrl === imgUrl.imageUrl);

        if (imageIndex > -1) {
          const publicId = project.images[imageIndex].public_id;
    
          // Remove from DB array
          project.images.splice(imageIndex, 1);
    
    
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

    await project.save();
    res.status(200).json(Project);
  } catch (err) {
    console.log('====================================');
    console.log(err);
    console.log('====================================');
    res.status(500).json({ error: err.message });
  }
};


// 5. Delete Project and its images from server
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Delete images from Cloudinary
    for (const imgObj of project.images) {
      try {
        await cloudinary.uploader.destroy(imgObj.public_id);
        console.log(`Deleted from Cloudinary: ${imgObj.public_id}`);
      } catch (err) {
        console.error(`Failed to delete ${imgObj.public_id}`, err);
      }
    }

    await project.deleteOne();
    res.json({ message: 'Project and images deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({}, 'name images description address').populate("service"); // only select name and images
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
