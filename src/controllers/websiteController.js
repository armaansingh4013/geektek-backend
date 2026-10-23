const Website = require('../models/Website');

exports.createWebsite = async (req, res) => {
  try {
    const { name, email, phone, address, url, facebook, instagram, linkedin, youtube, user } = req.body;
    
    const website = new Website({
      name,
      email,
      phone,
      address,
        url,
        facebook,
        instagram,
        linkedin,
        youtube,
        user,
      createdBy: req.user._id
    });

    await website.save();
    
    res.status(201).json({
      success: true,
      message: 'Website created successfully',
      data: website
    });
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    res.status(500).json({
      success: false,
      message: 'Error creating Website',
      error: error.message
    });
  }
};

exports.getAllWebsites = async (req, res) => {
  try {
    const Websites = await Website.find()
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      data: Websites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Websites',
      error: error.message
    });
  }
};

exports.getWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const website = await Website.findById(id);

    res.status(200).json({
      success: true,
      data: website
    });
    
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching Websites',
      error: error.message
    });
  }
};

exports.updateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, url, facebook, instagram, linkedin, youtube, user } = req.body;

    const Website = await Website.findById(id);
    
    if (!Website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    // Update the Website fields
    Website.name = name || Website.name;
    Website.email = email || Website.email;
    Website.phone = phone || Website.phone;
    Website.address = address || Website.address;
    Website.url = url || Website.url;
    Website.facebook = facebook || Website.facebook;
    Website.instagram = instagram || Website.instagram;
    Website.linkedin = linkedin || Website.linkedin;
    Website.youtube = youtube || Website.youtube;
    Website.user = user || Website.user;

    await Website.save();

    res.status(200).json({
      success: true,
      message: 'Website updated successfully',
      data: Website
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating Website',
      error: error.message
    });
  }
};

exports.deleteWebsite = async (req, res) => {
  try {
    const { id } = req.params;

    const Website = await Website.findById(id);
    
    if (!Website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found'
      });
    }

    await Website.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Website deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Website',
      error: error.message
    });
  }
}; 