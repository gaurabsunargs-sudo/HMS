const { body, validationResult } = require('express-validator');
const prisma = require('../config/database');
const { formatResponse, handlePrismaError } = require('../utils/helpers');

const getAllBeds = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [items, total] = await prisma.$transaction([
      prisma.Bed.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.Bed.count()
    ]);

    res.json(formatResponse(true, 'Beds retrieved successfully', items, {
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    console.error('Get Beds error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve Beds'));
  }
};

const getBedById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.Bed.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json(formatResponse(false, 'Bed not found'));
    }

    res.json(formatResponse(true, 'Bed retrieved successfully', item));
  } catch (error) {
    console.error('Get Bed error:', error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createBed = async (req, res) => {
  try {
    const item = await prisma.Bed.create({
      data: req.body
    });

    res.status(201).json(formatResponse(true, 'Bed created successfully', item));
  } catch (error) {
    console.error('Create Bed error:', error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateBed = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.Bed.update({
      where: { id },
      data: req.body
    });

    res.json(formatResponse(true, 'Bed updated successfully', item));
  } catch (error) {
    console.error('Update Bed error:', error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deleteBed = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.Bed.delete({
      where: { id }
    });

    res.json(formatResponse(true, 'Bed deleted successfully'));
  } catch (error) {
    console.error('Delete Bed error:', error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const getAllBedsSelect = async (req, res) => {
  try {
    const items = await prisma.Bed.findMany({
      orderBy: { bedNumber: 'asc' }
    });

    res.json(formatResponse(true, 'Beds retrieved successfully', items, {
      total: items.length
    }));
  } catch (error) {
    console.error('Get Beds error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve Beds'));
  }
};

module.exports = {
  getAllBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed,
  getAllBedsSelect
};
