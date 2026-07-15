import mongoose from "mongoose";
import { Fine } from "../models/fine.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET ALL FINES
const getAllFines = asyncHandler(async (req, res) => {
  const {
    status,
    member,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (member) {
    if (!mongoose.Types.ObjectId.isValid(member)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID",
      });
    }
    query.member = member;
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  const sortObj = { [sortBy]: order === "asc" ? 1 : -1 };

  const [fines, total, stats] = await Promise.all([
    Fine.find(query)
      .populate("member", "name email membershipId")
      .populate("transaction", "issueDate dueDate returnDate")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Fine.countDocuments(query),
    Fine.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
          },
          collectedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] },
          },
          waivedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "waived"] }, "$amount", 0] },
          },
        },
      },
    ]),
  ]);

  return res.status(200).json({
    success: true,
    data: fines,
    summary: stats[0] || {
      totalAmount: 0,
      pendingAmount: 0,
      collectedAmount: 0,
    },
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
});

// GET FINE BY ID
const getFineById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid fine ID",
    });
  }

  const fine = await Fine.findById(id)
    .populate("member", "name email membershipId phone")
    .populate("paidBy", "name email")
    .populate({
      path: "transaction",
      select: "issueDate dueDate returnDate status book",
      populate: {
        path: "book",
        select: "title isbn coverImage",
      },
    });

  if (!fine) {
    return res.status(404).json({
      success: false,
      message: "Fine not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: fine,
  });
});

// MARK FINE PAID
const markFinePaid = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid fine ID",
    });
  }

  const fine = await Fine.findById(id);
  if (!fine) {
    return res.status(404).json({
      success: false,
      message: "Fine not found",
    });
  }

  if (fine.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `Fine is already ${fine.status}`,
    });
  }

  fine.status = "paid";
  fine.paidAt = new Date();
  fine.paidBy = req.user._id;
  await fine.save();

  const updatedFine = await Fine.findById(fine._id)
    .populate("member", "name email membershipId")
    .populate("paidBy", "name");

  return res.status(200).json({
    success: true,
    message: `Fine of ₹${fine.amount} marked as paid successfully`,
    data: updatedFine,
  });
});

// WAIVE FINE
const waiveFine = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid fine ID",
    });
  }

  const fine = await Fine.findById(id);
  if (!fine) {
    return res.status(404).json({
      success: false,
      message: "Fine not found",
    });
  }

  if (fine.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: `Fine is already ${fine.status}`,
    });
  }

  fine.status = "waived";
  await fine.save();

  const { reason } = req.body;
  fine.status = "waived";
  fine.waivedBy = req.user._id; // who waived it
  fine.waivedAt = new Date(); // when it was waived
  fine.waivedReason = reason || ""; // why it was waived
  await fine.save();

  const updatedFine = await Fine.findById(fine._id).populate(
    "member",
    "name email membershipId"
  );

  return res.status(200).json({
    success: true,
    message: `Fine of ₹${fine.amount} waived successfully`,
    data: updatedFine,
  });
});

// GET MY FINES
const getMyFines = asyncHandler(async (req, res) => {
  const {
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = { member: req.user._id };
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  const sortObj = { [sortBy]: order === "asc" ? 1 : -1 };

  const [fines, total, summary] = await Promise.all([
    Fine.find(query)
      .populate({
        path: "transaction",
        select: "issueDate dueDate returnDate",
        populate: {
          path: "book",
          select: "title isbn coverImage",
        },
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Fine.countDocuments(query),
    Fine.aggregate([
      { $match: { member: req.user._id } },
      {
        $group: {
          _id: null,
          totalFines: { $sum: "$amount" },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
          },
          paidAmount: {
            $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$amount", 0] },
          },
        },
      },
    ]),
  ]);

  return res.status(200).json({
    success: true,
    data: fines,
    summary: summary[0] || {
      totalFines: 0,
      pendingAmount: 0,
      paidAmount: 0,
    },
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
});

export { getAllFines, getFineById, markFinePaid, waiveFine, getMyFines };
