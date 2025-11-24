const prisma = require("../config/database");
const { formatResponse } = require("../utils/helpers");

const getStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalBeds,
      occupiedBeds,
      pendingBills,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.bed.count(),
      prisma.bed.count({ where: { isOccupied: true } }),
      prisma.bill.count({
        where: { status: { in: ["PENDING", "OVERDUE", "PARTIAL"] } },
      }),
    ]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todayAppointments = await prisma.appointment.count({
      where: { dateTime: { gte: startOfToday, lte: endOfToday } },
    });

    // Monthly revenue (last 12 months)
    const now = new Date();
    const months = [...Array(12)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    });

    // Fetch bill totals and payments to compute revenue per month
    const bills = await prisma.bill.findMany({
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
      },
      select: { createdAt: true, totalAmount: true },
    });
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
        },
      },
      select: { paymentDate: true, amount: true },
    });

    const monthlyRevenue = months.map(({ y, m }) => {
      const monthBills = bills.filter(
        (b) =>
          b.createdAt.getFullYear() === y && b.createdAt.getMonth() + 1 === m
      );
      const monthPayments = payments.filter(
        (p) =>
          p.paymentDate.getFullYear() === y &&
          p.paymentDate.getMonth() + 1 === m
      );
      const revenue = monthPayments.reduce(
        (s, p) => s + parseFloat(p.amount),
        0
      );
      return { month: `${y}-${String(m).padStart(2, "0")}`, revenue };
    });

    // Department stats (by ward as proxy)
    const wards = await prisma.bed.groupBy({
      by: ["ward"],
      _count: { ward: true },
    });
    const departmentStats = wards.map((w) => ({
      department: w.ward,
      patientCount: w._count.ward,
      revenue: 0,
    }));

    const data = {
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue: monthlyRevenue.reduce((s, r) => s + r.revenue, 0),
      todayAppointments,
      occupiedBeds,
      totalBeds,
      pendingBills,
      recentAppointments: await prisma.appointment.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          patient: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
          doctor: {
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      }),
      monthlyRevenue,
      departmentStats,
    };

    return res.json(formatResponse(true, "Dashboard stats fetched", data));
  } catch (error) {
    console.error("Dashboard error", error);
    return res
      .status(500)
      .json(formatResponse(false, "Failed to fetch dashboard stats"));
  }
};

const getRevenueTrends = async (req, res) => {
  try {
    const { period = "30d" } = req.query;
    const days = period.endsWith("d") ? parseInt(period) : 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    const payments = await prisma.payment.findMany({
      where: { paymentDate: { gte: start } },
      select: { paymentDate: true, amount: true },
      orderBy: { paymentDate: "asc" },
    });
    const dailyMap = new Map();
    payments.forEach((p) => {
      const key = new Date(p.paymentDate).toISOString().slice(0, 10);
      const amt = parseFloat(p.amount);
      dailyMap.set(key, (dailyMap.get(key) || 0) + amt);
    });
    const data = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
    return res.json(formatResponse(true, "Revenue trends fetched", data));
  } catch (error) {
    console.error("Revenue trend error", error);
    return res
      .status(500)
      .json(formatResponse(false, "Failed to fetch revenue trends"));
  }
};

module.exports = { getStats, getRevenueTrends };
