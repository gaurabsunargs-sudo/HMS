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

    // Aggregate payments by admission (if available) or bill
    const admissionMap = new Map();

    // To ensure we have correct totals, we need to know all bills for the admissions found
    const admissionIds = payments
      .map((p) => p.bill?.admissionId)
      .filter((id) => id !== null && id !== undefined);

    const relatedBills = await prisma.bill.findMany({
      where: {
        admissionId: { in: admissionIds },
      },
      include: {
        billItems: true,
      },
    });

    payments.forEach((payment) => {
      const bill = payment.bill;
      const key = bill?.admissionId || `BILL_${payment.billId}`;

      if (!admissionMap.has(key)) {
        // Create aggregated entry
        const consolidatedBill = { ...bill };

        // If it's an admission, calculate total of ALL related bills
        if (bill?.admissionId) {
          const admissionBills = relatedBills.filter(
            (rb) => rb.admissionId === bill.admissionId
          );
          consolidatedBill.totalAmount = admissionBills.reduce(
            (sum, rb) => {
              if (rb.billNumber?.startsWith("BED-")) return sum;
              return sum + parseFloat(rb.totalAmount || 0);
            },
            0
          );
          // Combine bill items for the admission
          consolidatedBill.billItems = admissionBills.flatMap(
            (rb) => rb.billItems || []
          ).filter(bi => !bi.description?.toLowerCase().includes('bed charge'));
        }

        admissionMap.set(key, {
          id: key.startsWith("BILL_") ? key : `adm-${key}`,
          billId: payment.billId,
          bill: consolidatedBill,
          payments: [],
          totalPaidAmount: 0,
          latestPayment: payment,
          paymentCount: 0,
        });
      }

      const entry = admissionMap.get(key);
      entry.payments.push(payment);
      entry.totalPaidAmount += parseFloat(payment.amount || 0);
      entry.paymentCount += 1;

      // Keep the latest payment for display purposes
      if (
        new Date(payment.createdAt) >
        new Date(entry.latestPayment.createdAt)
      ) {
        entry.latestPayment = payment;
      }
    });

    const aggregatedItems = Array.from(admissionMap.values());

    res.json(
      formatResponse(true, "Payments retrieved successfully", aggregatedItems, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: aggregatedItems.length,
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
// --------------------- GET PAYMENT BY ID ---------------------
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Handle Aggregated Admission View (adm- prefix)
    if (id.startsWith("adm-")) {
      const admissionId = id.replace("adm-", "");

      // Get all payments linked to this admission (via bills)
      const payments = await prisma.payment.findMany({
        where: {
          bill: { admissionId },
        },
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
          .json(formatResponse(false, "No payments found for this admission"));
      }

      // Aggregate payments for the admission
      // We need to fetch all related bills to accurately calculate totals/items for the consolidated view
      const relatedBills = await prisma.bill.findMany({
        where: { admissionId },
        include: { billItems: true },
      });

      const firstPayment = payments[0];
      const consolidatedBill = { ...firstPayment.bill };

      // Calculate total amount for admission (sum of all related bills)
      consolidatedBill.totalAmount = relatedBills.reduce((sum, rb) => {
        if (rb.billNumber && rb.billNumber.startsWith("BED-")) return sum;
        return sum + parseFloat(rb.totalAmount || 0);
      }, 0);

      // Combine bill items for the admission
      consolidatedBill.billItems = relatedBills
        .flatMap((rb) => rb.billItems || [])
        .filter((bi) => !bi.description?.toLowerCase().includes("bed charge"));

      const aggregatedItem = {
        id: id,
        billId: firstPayment.billId, // Representative bill ID
        bill: consolidatedBill,
        payments: payments,
        totalPaidAmount: payments.reduce(
          (sum, p) => sum + parseFloat(p.amount || 0),
          0
        ),
        latestPayment: firstPayment, // derived from sort desc
        paymentCount: payments.length,
      };

      return res.json(
        formatResponse(true, "Payment retrieved successfully", aggregatedItem)
      );
    }

    // 2. Handle Aggregated Bill View (bill- or BILL_ prefix)
    if (id.startsWith("bill-") || id.startsWith("BILL_")) {
      const billId = id.replace(/^(bill-|BILL_)/, "");

      // Get all payments for this bill
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

      // Aggregate payments by bill
      const firstPayment = payments[0];
      const aggregatedItem = {
        id: id,
        billId: billId,
        bill: firstPayment.bill,
        payments: payments,
        totalPaidAmount: payments.reduce(
          (sum, p) => sum + parseFloat(p.amount || 0),
          0
        ),
        latestPayment: firstPayment,
        paymentCount: payments.length,
      };

      return res.json(
        formatResponse(true, "Payment retrieved successfully", aggregatedItem)
      );
    }

    // 3. Handle Individual Payment ID
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

  // If the bill is part of an admission, we must consider ALL bills for that admission
  let allRelatedBills = [bill];
  if (bill.admissionId) {
    const otherBills = await prisma.bill.findMany({
      where: {
        admissionId: bill.admissionId,
        id: { not: bill.id },
      },
      include: {
        payments: true,
        billItems: true,
      },
    });
    allRelatedBills = [...allRelatedBills, ...otherBills];
  }

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

  // Sum up all bill items and bill totals from all related bills
  const billItemsTotal = allRelatedBills.reduce((sum, rb) => {
    const itemsSum = (rb.billItems || []).reduce(
      (s, item) => s + (item.totalPrice || 0),
      0
    );
    return sum + itemsSum;
  }, 0);

  // We use the sum of all bill.totalAmount as the base for items
  // (Exclude bed-specific bills to avoid double counting with the dynamic bedCharge calculation)
  const totalAmountFromBills = allRelatedBills.reduce(
    (sum, rb) => {
      if (rb.billNumber && rb.billNumber.startsWith("BED-")) {
        return sum; // Skip bed bills as they are calculated dynamically below
      }
      return sum + parseFloat(rb.totalAmount || 0);
    },
    0
  );

  // The actual total for the stay is Admission + Bed + sum of all non-bed Bills
  const actualTotalAmount = admissionCharge + bedCharge + totalAmountFromBills;

  // Sum up all payments across all related bills
  const totalPaidAcrossStay = allRelatedBills.reduce((sum, rb) => {
    const billPaid = (rb.payments || []).reduce(
      (s, p) => s + parseFloat(p.amount || 0),
      0
    );
    return sum + billPaid;
  }, 0);

  return {
    bill,
    admissionCharge,
    bedCharge,
    billItemsTotal: totalAmountFromBills, // This is what we display as services total
    actualTotalAmount,
    totalPaidAcrossStay,
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

    const { bill, actualTotalAmount, totalPaidAcrossStay } = billData;
    const paymentAmount = parseFloat(amount);

    const remainingAmount = actualTotalAmount - totalPaidAcrossStay;

    if (paymentAmount > remainingAmount + 0.01) { // Added small buffer for decimal precision
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
    const totalPaidAfter = totalPaidAcrossStay + paymentAmount;

    let newStatus = "PENDING";
    if (totalPaidAfter >= actualTotalAmount - 0.01) {
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

    const billData = await calculateBillTotal(existingPayment.billId);
    const actualTotalAmount = billData ? billData.actualTotalAmount : parseFloat(existingPayment.bill.totalAmount);

    let newStatus = "PENDING";
    if (totalPaid > 0 && totalPaid < actualTotalAmount) {
      newStatus = "PARTIAL";
    } else if (totalPaid >= actualTotalAmount) {
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
