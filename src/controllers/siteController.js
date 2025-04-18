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

    // Format date to YYYY-MM-DD
    const holidayDate = new Date(date);
    holidayDate.setHours(0, 0, 0, 0);
    const dateKey = holidayDate.toISOString().split('T')[0];

    // Add or update holiday
    site.holidays.set(dateKey, {
      description: description || '',
      isActive: true
    });

    await site.save();

    res.json(site);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message });
  }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
  try {
    const { date, description, isActive } = req.body;
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Format date to YYYY-MM-DD
    const [year, month, day] = date.split('-');
const utcDate = new Date(Date.UTC(year, month - 1, day));
const dateKey = utcDate.toISOString().split('T')[0];
    // Initialize holidays as Map if it's not already
    if (!(site.holidays instanceof Map)) {
      site.holidays = new Map();
    }

    // Check if holiday exists
    if (!site.holidays.has(dateKey)) {
      return res.status(404).json({ message: `No holiday found for date ${dateKey}` });
    }

    // Get existing holiday data
    const existingHoliday = site.holidays.get(dateKey);

    // Update holiday
    site.holidays.set(dateKey, {
      description: description || existingHoliday.description,
      isActive: isActive !== undefined ? isActive : existingHoliday.isActive
    });

    await site.save();
    res.json({
      message: 'Holiday updated successfully',
      holiday: {
        date: dateKey,
        description: site.holidays.get(dateKey).description,
        isActive: site.holidays.get(dateKey).isActive
      }
    });
  } catch (error) {
    console.error('Error in updateHoliday:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const { date } = req.params;
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Format date to YYYY-MM-DD
    const [year, month, day] = date.split('-');
const utcDate = new Date(Date.UTC(year, month - 1, day));
const dateKey = utcDate.toISOString().split('T')[0];

    if (!site.holidays.has(dateKey)) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    site.holidays.delete(dateKey);
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

    // Convert Map to array of objects for response
    const holidays = Array.from(site.holidays.entries()).map(([date, data]) => ({
      date,
      description: data.description,
      isActive: data.isActive
    }));

    res.json(holidays);
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