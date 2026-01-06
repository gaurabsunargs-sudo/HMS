const prisma = require("../config/database");
const { formatResponse } = require("../utils/helpers");

const getStats = async (req, res) => {
  try {
    const { role, doctor, patient } = req.user;

    // PATIENT Dashboard Stats
    if (role === "PATIENT") {
      if (!patient) {
        return res
          .status(403)
          .json(formatResponse(false, "Access denied. Patient profile not found."));
      }
      const patientId = patient.id;
      const [
        totalAppointments,
        allBills,
        recentAppointments,
        totalMedicalRecords,
        activeAdmissions,
      ] = await Promise.all([
        prisma.appointment.count({ where: { patientId } }),
        prisma.bill.findMany({
          where: { patientId },
          include: { payments: true },
        }),
        prisma.appointment.findMany({
          where: { patientId },
          orderBy: { dateTime: "desc" },
          take: 5,
          include: {
            doctor: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        prisma.medicalRecord.count({ where: { patientId } }),
        prisma.admission.findMany({
          where: { patientId, status: "ADMITTED" },
          include: { bed: true },
        }),
      ]);

      let totalDue = 0;
      let totalPaid = 0;

      // 1. Calculate Total Payments (from all bills)
      allBills.forEach((bill) => {
        const billPaid = bill.payments.reduce(
          (sum, p) => sum + parseFloat(p.amount || 0),
          0
        );
        totalPaid += billPaid;

        // 2. Add Bill Totals (Exclude BED- bills to avoid double counting)
        if (!bill.billNumber?.startsWith("BED-")) {
          totalDue += parseFloat(bill.totalAmount || 0);
        }
      });

      // 3. Process All Admissions (for fees and bed charges)
      const allAdmissions = await prisma.admission.findMany({
        where: { patientId },
        include: { bed: true }
      });

      allAdmissions.forEach((admission) => {
        // Add basic admission fee (Rs 1200)
        totalDue += parseFloat(admission.totalAmount || 0);

        // Add bed charge (either until discharge or until now)
        if (admission.bed) {
          const start = new Date(admission.admissionDate);
          const end = admission.dischargeDate ? new Date(admission.dischargeDate) : new Date();
          const millisPerDay = 24 * 60 * 60 * 1000;
          const stayDays = Math.max(1, Math.ceil((end - start) / millisPerDay));
          totalDue += stayDays * parseFloat(admission.bed.pricePerDay || 0);
        }
      });

      const pendingAmount = Math.max(0, totalDue - totalPaid);

      const data = {
        totalAppointments,
        pendingBills: pendingAmount,
        recentAppointments,
        totalMedicalRecords,
        totalPatients: 0,
        totalDoctors: 0,
        totalRevenue: 0,
        todayAppointments: 0,
        occupiedBeds: 0,
        totalBeds: 0,
        monthlyRevenue: [],
        departmentStats: [],
      };
      return res.json(
        formatResponse(true, "Patient dashboard stats fetched", data)
      );
    }


    // DOCTOR Dashboard Stats
    if (role === "DOCTOR") {
      if (!doctor) {
        return res
          .status(403)
          .json(formatResponse(false, "Access denied. Doctor profile not found."));
      }
      const doctorId = doctor.id;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const [
        totalPatients,
        totalAppointments,
        todayAppointments,
        recentAppointments,
      ] = await Promise.all([
        prisma.appointment
          .groupBy({
            by: ["patientId"],
            where: { doctorId },
            _count: { patientId: true },
          })
          .then((res) => res.length),
        prisma.appointment.count({ where: { doctorId } }),
        prisma.appointment.count({
          where: {
            doctorId,
            dateTime: { gte: startOfToday, lte: endOfToday },
          },
        }),
        prisma.appointment.findMany({
          where: { doctorId },
          orderBy: { dateTime: "desc" },
          take: 5,
          include: {
            patient: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
      ]);

      const data = {
        totalPatients,
        totalAppointments,
        todayAppointments,
        recentAppointments,
        totalDoctors: 0,
        totalRevenue: 0,
        occupiedBeds: 0,
        totalBeds: 0,
        pendingBills: 0,
        monthlyRevenue: [],
        departmentStats: [],
      };
      return res.json(formatResponse(true, "Doctor dashboard stats fetched", data));
    }

    // ADMIN Dashboard Stats (Default)
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

    const now = new Date();
    const months = [...Array(12)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    });

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
    const { role } = req.user;
    if (role !== "ADMIN") {
      return res.json(formatResponse(true, "Revenue trends fetched", []));
    }

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
