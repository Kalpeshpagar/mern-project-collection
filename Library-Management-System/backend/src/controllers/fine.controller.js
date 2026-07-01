import { asyncHandler } from "../utils/asyncHandler";

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

const getFineById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid fine ID"
        });
    }

    const fine = await Fine.findById(id)
        .populate('member',      'name email membershipId phone')
        .populate('paidBy',      'name email')
        .populate({
            path: 'transaction',
            select: 'issueDate dueDate returnDate status book',
            populate: {
                path:   'book',
                select: 'title isbn coverImage'
            }
        });

    if (!fine) {
        return res.status(404).json({
            success: false,
            message: "Fine not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: fine
    });
});

export {
    getAllFines,
    getFineById
}