const University = require("../models/university.model");
const User = require("../models/user.model");
const Discussion = require("../models/discussion.model");

const normalizeRole = (r) =>
  String(r || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

exports.getDashboardStats = async (_req, res) => {
  try {
    const [universityCount, users, discussionCount, discussionSeries] = await Promise.all([
      University.countDocuments(),
      User.find({}, { role: 1 }).lean(),
      Discussion.countDocuments().catch(() => 0),
      Discussion.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]).catch(() => []),
    ]);

    let studentCount = 0;
    let universityAdminCount = 0;
    let systemAdminCount = 0;
    for (const u of users) {
      const role = normalizeRole(u.role);
      if (role === "student") studentCount += 1;
      else if (role === "university_admin") universityAdminCount += 1;
      else if (role === "system_admin") systemAdminCount += 1;
    }

    const universities = await University.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("name domain description createdAt")
      .lean();

    const dayKeys = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      dayKeys.push(d.toISOString().slice(0, 10));
    }
    const countByDay = Object.fromEntries((discussionSeries || []).map((x) => [x._id, x.count]));
    const activityLast7Days = dayKeys.map((day) => ({
      date: day,
      count: countByDay[day] || 0,
    }));

    const maxActivity = Math.max(1, ...activityLast7Days.map((d) => d.count));

    return res.status(200).json({
      message: "Dashboard stats fetched",
      data: {
        universityCount,
        studentCount,
        universityAdminCount,
        systemAdminCount,
        totalUsers: users.length,
        discussionCount,
        universities,
        activityLast7Days,
        maxActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
