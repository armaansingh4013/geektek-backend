const Site = require('../models/Site');
const Attendance = require('../models/Attendance');

// Create new site
exports.createSite = async (req, res) => {
  try {
    const { name, address, location, radius } = req.body;

    const site = new Site({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: location
      },
      radius
    });

    await site.save();
    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sites
exports.getAllSites = async (req, res) => {
  try {
    const sites = await Site.find();
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get site by ID
exports.getSiteById = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update site
exports.updateSite = async (req, res) => {
  try {
    const { name, address, location, radius, isActive } = req.body;
    const site = await Site.findByIdAndUpdate(
      req.params.id,
      { name, address, location, radius, isActive },
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add holiday to site
exports.addHoliday = async (req, res) => {
  try {
    const { date, description } = req.body;
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Check if holiday already exists for this date
    const existingHoliday = site.holidays.find(h => {
      const holidayDate = new Date(h.date);
      const newDate = new Date(date);
      return holidayDate.toDateString() === newDate.toDateString();
    });

    if (existingHoliday) {
      return res.status(400).json({ message: 'Holiday already exists for this date' });
    }

    site.holidays.push({ date, description });
    await site.save();

    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { holidayId, date, description, isActive } = req.body;
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    const holiday = site.holidays.id(holidayId);
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    holiday.date = date;
    holiday.description = description;
    holiday.isActive = isActive;

    await site.save();
    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const { holidayId } = req.params;
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    site.holidays = site.holidays.filter(h => h._id.toString() !== holidayId);
    await site.save();

    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get site holidays
exports.getSiteHolidays = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    res.json(site.holidays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all enabled sites
exports.getEnabledSites = async (req, res) => {
  try {
    const sites = await Site.find({ isActive: true });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 