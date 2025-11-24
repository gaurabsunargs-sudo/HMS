const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");

// --------------------- GET ALL PAYMENTS ---------------------
const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", paymentMethod } = req.query;
    const skip = (page - 1) * limit;
    const { role, doctor, patient } = req.user;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      if (doctor && doctor.id) {
        // Doctor can see payments for bills of patients they have treated
        const doctorAppointments = await prisma.appointment.findMany({
          where: { doctorId: doctor.id },
          select: { patientId: true },
          distinct: ["patientId"],
        });

        const doctorAdmissions = await prisma.admission.findMany({
          where: { doctorId: doctor.id },
          select: { patientId: true },
          distinct: ["patientId"],
        });

        const patientIds = [
          ...doctorAppointments.map((app) => app.patientId),
          ...doctorAdmissions.map((adm) => adm.patientId),
        ].filter((id, index, array) => array.indexOf(id) === index); // Remove duplicates

        if (patientIds.length > 0) {
          where.bill = {
            patientId: { in: patientIds },
          };
        } else {
          // If doctor has no patients, return empty array
          return res.json(
            formatResponse(true, "Payments retrieved successfully", [], {
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                pages: 0,
              },
            })
          );
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Doctor profile not found.",
        });
      }
    } else if (role === "PATIENT") {
      if (patient && patient.id) {
        // Patient can see payments for their own bills
        where.bill = {
          patientId: patient.id,
        };
        console.log("Filtering by patientId:", patient.id);
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Patient profile not found.",
        });
      }
    }
    // For ADMIN role, no filtering is applied (can see all payments)

    // Filter by payment method if provided
    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Add search functionality
    if (search) {
      where = {
        ...where,
        OR: [
          {
            bill: {
              patient: {
                user: {
                  OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            },
          },
          {
            transactionId: { contains: search, mode: "insensitive" },
          },
          {
            bill: {
              billNumber: { contains: search, mode: "insensitive" },
            },
          },
        ],
      };
    }

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        where,
        include: {
          bill: {
            include: {
              patient: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      email: true,
                      firstName: true,
                      middleName: true,
                      lastName: true,
                    },
                  },
                },
              },
              admission: {
                include: {
                  bed: true,
                },
              },
              billItems: true,
              payments: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    // Aggregate payments by bill
    const billMap = new Map();

    payments.forEach((payment) => {
      const billId = payment.billId;

      if (!billMap.has(billId)) {
        // Create aggregated bill entry
        billMap.set(billId, {
          id: `bill-${billId}`, // Unique ID for the aggregated row
          billId: billId,
          bill: payment.bill,
          payments: [],
          totalPaidAmount: 0,
          latestPayment: payment,
          paymentCount: 0,
        });
      }

      const billEntry = billMap.get(billId);
      billEntry.payments.push(payment);
      billEntry.totalPaidAmount += parseFloat(payment.amount || 0);
      billEntry.paymentCount += 1;

      // Keep the latest payment for display purposes
      if (
        new Date(payment.createdAt) >
        new Date(billEntry.latestPayment.createdAt)
      ) {
        billEntry.latestPayment = payment;
      }
    });

    const aggregatedItems = Array.from(billMap.values());

    res.json(
      formatResponse(true, "Payments retrieved successfully", aggregatedItems, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: aggregatedItems.length, // Use aggregated count
          pages: Math.ceil(aggregatedItems.length / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get Payments error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve Payments"));
  }
};

// --------------------- GET PAYMENT BY ID ---------------------
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if this is an aggregated bill ID (starts with "bill-")
    if (id.startsWith("bill-")) {
      const billId = id.replace("bill-", "");

      // Get all payments for this bill and aggregate them
      const payments = await prisma.payment.findMany({
        where: { billId },
        include: {
          bill: {
            include: {
              patient: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      email: true,
                      firstName: true,
                      middleName: true,
                      lastName: true,
                    },
                  },
                },
              },
              admission: {
                include: {
                  bed: true,
                },
              },
              billItems: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (payments.length === 0) {
        return res
          .status(404)
          .json(formatResponse(false, "No payments found for this bill"));
      }

      // Aggregate payments by bill (same logic as getAllPayments)
      const billMap = new Map();

      payments.forEach((payment) => {
        const billId = payment.billId;

        if (!billMap.has(billId)) {
          // Create aggregated bill entry
          billMap.set(billId, {
            id: `bill-${billId}`, // Unique ID for the aggregated row
            billId: billId,
            bill: payment.bill,
            payments: [],
            totalPaidAmount: 0,
            latestPayment: payment,
            paymentCount: 0,
          });
        }

        const billEntry = billMap.get(billId);
        billEntry.payments.push(payment);
        billEntry.totalPaidAmount += parseFloat(payment.amount || 0);
        billEntry.paymentCount += 1;

        // Keep the latest payment for display purposes
        if (
          new Date(payment.createdAt) >
          new Date(billEntry.latestPayment.createdAt)
        ) {
          billEntry.latestPayment = payment;
        }
      });

      const aggregatedItem = Array.from(billMap.values())[0]; // Get the single aggregated item

      res.json(
        formatResponse(true, "Payment retrieved successfully", aggregatedItem)
      );
    } else {
      // Handle individual payment ID
      const item = await prisma.payment.findUnique({
        where: { id },
        include: {
          bill: {
            include: {
              patient: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      email: true,
                      firstName: true,
                      middleName: true,
                      lastName: true,
                    },
                  },
                },
              },
              admission: {
                include: {
                  bed: true,
                },
              },
              billItems: true,
              payments: true,
            },
          },
        },
      });

      if (!item) {
        return res.status(404).json(formatResponse(false, "Payment not found"));
      }

      res.json(formatResponse(true, "Payment retrieved successfully", item));
    }
  } catch (error) {
    console.error("Get Payment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

// --------------------- VALIDATION RULES FOR UPDATE ---------------------
const validatePaymentUpdate = [
  body("amount")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal with up to 2 decimal places")
    .custom((value) => {
      if (value && parseFloat(value) <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return true;
    }),
  body("paymentMethod")
    .optional()
    .isIn(["CASH", "BANK"])
    .withMessage("Payment method must be either CASH or BANK"),
  body("notes").optional().isString().withMessage("Notes must be a string"),

  // Cash-specific validation
  body("receivedBy")
    .optional()
    .isString()
    .withMessage("Received By must be a string"),
  body("receiptNo")
    .optional()
    .isString()
    .withMessage("Receipt Number must be a string"),

  // Bank-specific validation
  body("bankName")
    .optional()
    .isString()
    .withMessage("Bank Name must be a string"),
  body("transactionId")
    .optional()
    .isString()
    .withMessage("Transaction ID must be a string"),
  body("cardLast4")
    .optional()
    .isString()
    .withMessage("Card Last 4 must be a string"),
  body("authorizationCode")
    .optional()
    .isString()
    .withMessage("Authorization Code must be a string"),
];
const validatePayment = [
  body("billId")
    .notEmpty()
    .withMessage("Bill ID is required")
    .isString()
    .withMessage("Bill ID must be a string"),
  body("amount")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid decimal with up to 2 decimal places")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return true;
    }),
  body("paymentMethod")
    .isIn(["CASH", "BANK"])
    .withMessage("Payment method must be either CASH or BANK"),
  body("notes").optional().isString().withMessage("Notes must be a string"),

  // Cash-specific validation
  body("receivedBy")
    .optional()
    .isString()
    .withMessage("Received By must be a string"),
  body("receiptNo")
    .optional()
    .isString()
    .withMessage("Receipt Number must be a string"),

  // Bank-specific validation
  body("bankName")
    .optional()
    .isString()
    .withMessage("Bank Name must be a string"),
  body("transactionId")
    .optional()
    .isString()
    .withMessage("Transaction ID must be a string"),
  body("cardLast4")
    .optional()
    .isString()
    .withMessage("Card Last 4 must be a string"),
  body("authorizationCode")
    .optional()
    .isString()
    .withMessage("Authorization Code must be a string"),
];

// Helper function to calculate actual bill total including admission and bed charges
const calculateBillTotal = async (billId) => {
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      payments: true,
      admission: {
        include: {
          bed: true,
        },
      },
      billItems: true,
    },
  });

  if (!bill) return null;

  let admissionCharge = 0;
  let bedCharge = 0;

  if (bill.admission) {
    admissionCharge = parseFloat(bill.admission.totalAmount || 0);

    if (bill.admission.bed?.pricePerDay) {
      const admissionDate = new Date(bill.admission.admissionDate);
      const dischargeDate = bill.admission.dischargeDate
        ? new Date(bill.admission.dischargeDate)
        : new Date();
      const daysDiff = Math.max(
        1,
        Math.ceil(
          (dischargeDate.getTime() - admissionDate.getTime()) /
            (24 * 60 * 60 * 1000)
        )
      );
      bedCharge = daysDiff * parseFloat(bill.admission.bed.pricePerDay);
    }
  }

  const billItemsTotal = bill.billItems.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );
  const actualTotalAmount = admissionCharge + bedCharge + billItemsTotal;

  return {
    bill,
    admissionCharge,
    bedCharge,
    billItemsTotal,
    actualTotalAmount,
  };
};

// --------------------- CREATE PAYMENT ---------------------
const createPayment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        formatResponse(false, "Validation failed", null, {
          errors: errors.array(),
        })
      );
    }

    const {
      billId,
      amount,
      paymentMethod,
      notes,
      // Cash-specific
      receivedBy,
      receiptNo,
      // Bank-specific
      bankName,
      transactionId,
      cardLast4,
      authorizationCode,
    } = req.body;

    // Calculate actual bill total including admission and bed charges
    const billData = await calculateBillTotal(billId);

    if (!billData) {
      return res.status(404).json(formatResponse(false, "Bill not found"));
    }

    const { bill, actualTotalAmount } = billData;
    const paymentAmount = parseFloat(amount);

    // Calculate current total paid before adding new payment
    const totalPaidBefore = bill.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0
    );

    const remainingAmount = actualTotalAmount - totalPaidBefore;

    if (paymentAmount > remainingAmount) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            `Payment amount exceeds remaining bill amount. Remaining: Rs ${remainingAmount.toFixed(
              2
            )}`
          )
        );
    }

    // Create the payment
    const newPayment = await prisma.payment.create({
      data: {
        billId,
        amount: paymentAmount,
        paymentMethod,
        notes: notes || null,
        // Cash-specific
        receivedBy: receivedBy || null,
        receiptNo: receiptNo || null,
        // Bank-specific
        bankName: bankName || null,
        transactionId: transactionId || null,
        cardLast4: cardLast4 || null,
        authorizationCode: authorizationCode || null,
      },
    });

    // Recalculate total paid after this payment
    const totalPaidAfter = totalPaidBefore + paymentAmount;

    let newStatus = "PENDING";
    if (totalPaidAfter >= parseFloat(bill.totalAmount)) {
      newStatus = "PAID";
    } else if (totalPaidAfter > 0) {
      newStatus = "PARTIAL";
    }

    // Update bill status
    await prisma.bill.update({
      where: { id: billId },
      data: { status: newStatus },
    });

    // Fetch fresh bill with relations
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: newPayment.id },
      include: {
        bill: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res
      .status(201)
      .json(
        formatResponse(true, "Payment created successfully", updatedPayment)
      );
  } catch (error) {
    console.error("Create Payment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

// --------------------- UPDATE PAYMENT ---------------------
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        formatResponse(false, "Validation failed", null, {
          errors: errors.array(),
        })
      );
    }

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { bill: true },
    });

    if (!existingPayment) {
      return res.status(404).json(formatResponse(false, "Payment not found"));
    }

    // Prepare update data with only provided fields
    const updateData = {};
    const allowedFields = [
      "amount",
      "paymentMethod",
      "notes",
      "receivedBy",
      "receiptNo",
      "bankName",
      "transactionId",
      "cardLast4",
      "authorizationCode",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field] || null;
      }
    });

    const item = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        bill: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                    firstName: true,
                    middleName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json(formatResponse(true, "Payment updated successfully", item));
  } catch (error) {
    console.error("Update Payment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

// --------------------- DELETE PAYMENT ---------------------
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { bill: true },
    });

    if (!existingPayment) {
      return res.status(404).json(formatResponse(false, "Payment not found"));
    }

    await prisma.payment.delete({ where: { id } });

    // Recalculate bill status after deletion
    const billPayments = await prisma.payment.findMany({
      where: { billId: existingPayment.billId },
    });

    const totalPaid = billPayments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount),
      0
    );
    const billTotal = parseFloat(existingPayment.bill.totalAmount);

    let newStatus = "PENDING";
    if (totalPaid > 0 && totalPaid < billTotal) {
      newStatus = "PARTIAL";
    } else if (totalPaid >= billTotal) {
      newStatus = "PAID";
    }

    await prisma.bill.update({
      where: { id: existingPayment.billId },
      data: { status: newStatus },
    });

    res.json(formatResponse(true, "Payment deleted successfully"));
  } catch (error) {
    console.error("Delete Payment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  validatePayment,
  validatePaymentUpdate,
};
