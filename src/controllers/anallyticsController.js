
const Website = require("../models/Website");


/*
|--------------------------------------------------------------------------
| Track Website Visit
|--------------------------------------------------------------------------
|
| Public API.
|
| The public website sends:
|
| {
|   websiteId,
|   sessionId
| }
|
| If the session already exists, we don't add another view.
|
*/
const trackVisit = async (req, res) => {
  try {
    const {
      websiteId,
      sessionId,
    } = req.body;

    /*
     * Validate request.
     */
    if (!websiteId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "websiteId and sessionId are required",
      });
    }

    /*
     * Find website.
     */
    const website = await Website.findById(
      websiteId
    );

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    /*
     * Check whether this session has
     * already been counted.
     */
    const existingView = website.views.find(
      (view) => view.sessionId === sessionId
    );

    if (existingView) {
      return res.status(200).json({
        success: true,
        counted: false,
        message: "Session already counted",
      });
    }

    /*
     * Add new visitor session.
     */
    website.views.push({
      sessionId,
      createdAt: new Date(),
    });

    await website.save();

    return res.status(201).json({
      success: true,
      counted: true,
      message: "Website visit counted",
    });

  } catch (error) {
    console.error(
      "Track website visit error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to track website visit",
    });
  }
};


/*
|--------------------------------------------------------------------------
| Get Website Analytics
|--------------------------------------------------------------------------
|
| Protected API.
|
| We get websiteId from the authenticated user.
| We DON'T trust websiteId from the frontend.
|
*/
const getAnalytics = async (req, res) => {
  try {

    /*
     * Assuming auth middleware gives us:
     *
     * req.user.websiteId
     */
    const websiteId =
      req.user?.websiteId;

    

    if (!websiteId) {
      return res.status(403).json({
        success: false,
        message:
          "No website assigned to this account",
      });
    }

    /*
     * Find website.
     */
    const website = await Website.findById(
      websiteId
    ).select("views");

    if (!website) {
      return res.status(404).json({
        success: false,
        message: "Website not found",
      });
    }

    const now = new Date();

    /*
     * Start of today.
     */
    const startOfToday = new Date(now);

    startOfToday.setHours(0, 0, 0, 0);


    /*
     * Start of week.
     *
     * Monday = first day.
     */
    const startOfWeek = new Date(now);

    const day = startOfWeek.getDay();

    const difference =
      day === 0 ? 6 : day - 1;

    startOfWeek.setDate(
      startOfWeek.getDate() - difference
    );

    startOfWeek.setHours(0, 0, 0, 0);


    /*
     * Start of month.
     */
    const startOfMonth = new Date(now);

    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);


    /*
     * Calculate counts.
     */
    const totalViews =
      website.views.length;

    const todayViews =
      website.views.filter(
        (view) =>
          view.createdAt >= startOfToday
      ).length;

    const weeklyViews =
      website.views.filter(
        (view) =>
          view.createdAt >= startOfWeek
      ).length;

    const monthlyViews =
      website.views.filter(
        (view) =>
          view.createdAt >= startOfMonth
      ).length;


    return res.status(200).json({
      success: true,

      data: {
        totalViews,
        todayViews,
        weeklyViews,
        monthlyViews,
      },
    });

  } catch (error) {
    console.error(
      "Get analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get website analytics",
    });
  }
};


module.exports = {
  trackVisit,
  getAnalytics,
};
