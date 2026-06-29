const getAllTransactions = asyncHandler(async (req, res) => {
  const {
    status,
    member,
    book,
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
  if (book) {
    if (!mongoose.Types.ObjectId.isValid(book)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }
    query.book = book;
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  const sortObj = { [sortBy]: order === "asc" ? 1 : -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate("book", "title isbn coverImage")
      .populate("member", "name email membershipId")
      .populate("issuedBy", "name")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Transaction.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    data: transactions,
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

const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction ID",
    });
  }

  const transaction = await Transaction.findById(id)
    .populate("book", "title isbn coverImage author")
    .populate("member", "name email membershipId phone")
    .populate("issuedBy", "name email")
    .populate("returnedBy", "name email")
    .populate("fine");

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: "Transaction not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: transaction,
  });
});

const issueBook = asyncHandler(async (req, res) => {
    const { bookId, memberId } = req.body;

    // ── 1. Validate ObjectIds ─────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid book ID"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid member ID"
        });
    }

    // ── 2. Check book exists and is available ─────────────────────────
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
        return res.status(404).json({
            success: false,
            message: "Book not found"
        });
    }

    if (book.availableCopies < 1) {
        return res.status(400).json({
            success: false,
            message: "No copies available for this book"
        });
    }

    // ── 3. Check member exists and is active ──────────────────────────
    const member = await User.findOne({ _id: memberId, role: 'member' });
    if (!member || !member.isActive) {
        return res.status(404).json({
            success: false,
            message: "Member not found"
        });
    }

    // ── 4. Check member has no overdue books ──────────────────────────
    const overdueBooks = await Transaction.countDocuments({
        member: memberId,
        status: 'overdue'
    });

    if (overdueBooks > 0) {
        return res.status(400).json({
            success: false,
            message: `Member has ${overdueBooks} overdue ${overdueBooks === 1 ? 'book' : 'books'}. Please return them before issuing new books`
        });
    }

    // ── 5. Check member borrow limit ──────────────────────────────────
    const activeBorrows = await Transaction.countDocuments({
        member: memberId,
        returnDate: null
    });

    if (activeBorrows >= member.borrowLimit) {
        return res.status(400).json({
            success: false,
            message: `Member has reached their borrow limit of ${member.borrowLimit} books`
        });
    }

    // ── 6. Check member has no pending fines ──────────────────────────
    const pendingFines = await Fine.countDocuments({
        member: memberId,
        status: 'pending'
    });

    if (pendingFines > 0) {
        return res.status(400).json({
            success: false,
            message: `Member has ${pendingFines} unpaid ${pendingFines === 1 ? 'fine' : 'fines'}. Please clear them before issuing new books`
        });
    }

    // ── 7. Calculate due date (14 days from today) ────────────────────
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (parseInt(process.env.DEFAULT_LOAN_DAYS) || 14));

    // ── 8. Decrement availableCopies atomically ───────────────────────
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });

    // ── 9. Create transaction ─────────────────────────────────────────
    const transaction = await Transaction.create({
        book:      bookId,
        member:    memberId,
        issuedBy:  req.user._id,
        issueDate: new Date(),
        dueDate,
        status:   'issued',
    });

    const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('book',   'title isbn coverImage')
        .populate('member', 'name email membershipId')
        .populate('issuedBy', 'name');

    return res.status(201).json({
        success: true,
        message: "Book issued successfully",
        data: populatedTransaction
    });
});

const returnBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // ── 1. Validate ObjectId ──────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid transaction ID"
        });
    }

    // ── 2. Find transaction ───────────────────────────────────────────
    const transaction = await Transaction.findById(id);
    if (!transaction) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found"
        });
    }

    // ── 3. Check transaction is returnable ────────────────────────────
    if (!['issued', 'overdue'].includes(transaction.status)) {
        return res.status(400).json({
            success: false,
            message: `Cannot return a book with status: ${transaction.status}`
        });
    }

    // ── 4. Calculate if overdue ───────────────────────────────────────
    const today       = new Date();
    const dueDate     = new Date(transaction.dueDate);
    const isOverdue   = today > dueDate;

    let fine = null;

    if (isOverdue) {
        const diffTime    = today - dueDate;
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const perDayRate  = parseFloat(process.env.FINE_PER_DAY) || 2;
        const amount      = daysOverdue * perDayRate;

        // ── 5. Create fine record ─────────────────────────────────────
        fine = await Fine.create({
            transaction: transaction._id,
            member:      transaction.member,
            amount,
            perDayRate,
            daysOverdue,
            status: 'pending',
        });

        // ── 6. Link fine to transaction ───────────────────────────────
        transaction.fine = fine._id;
    }

    // ── 7. Update transaction ─────────────────────────────────────────
    transaction.returnDate  = today;
    transaction.returnedBy  = req.user._id;
    transaction.status      = 'returned';
    await transaction.save();

    // ── 8. Increment availableCopies atomically ───────────────────────
    await Book.findByIdAndUpdate(
        transaction.book,
        { $inc: { availableCopies: 1 } }
    );

    // ── 9. Return response ────────────────────────────────────────────
    const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('book',       'title isbn')
        .populate('member',     'name email membershipId')
        .populate('returnedBy', 'name')
        .populate('fine');

    return res.status(200).json({
        success: true,
        message: fine
            ? `Book returned with a fine of ₹${fine.amount} for ${fine.daysOverdue} overdue days`
            : "Book returned successfully",
        data: populatedTransaction
    });
});

const renewBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // ── 1. Validate ObjectId ──────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid transaction ID"
        });
    }

    // ── 2. Find transaction ───────────────────────────────────────────
    const transaction = await Transaction.findById(id);
    if (!transaction) {
        return res.status(404).json({
            success: false,
            message: "Transaction not found"
        });
    }

    // ── 3. Check transaction is renewable ─────────────────────────────
    if (transaction.status !== 'issued') {
        return res.status(400).json({
            success: false,
            message: `Cannot renew a book with status: ${transaction.status}`
        });
    }

    // ── 4. Check renewal limit ────────────────────────────────────────
    const MAX_RENEWALS = parseInt(process.env.MAX_RENEWALS) || 2;
    if (transaction.renewCount >= MAX_RENEWALS) {
        return res.status(400).json({
            success: false,
            message: `Renewal limit of ${MAX_RENEWALS} reached for this book`
        });
    }

    // ── 5. Check no other member has reserved this book ───────────────
    const hasReservation = await Transaction.findOne({
        book:   transaction.book,
        status: 'reserved',
        member: { $ne: transaction.member }   // $ne = not equal to current member
    });

    if (hasReservation) {
        return res.status(400).json({
            success: false,
            message: "Cannot renew. Another member has reserved this book"
        });
    }

    // ── 6. Check member has no pending fines ──────────────────────────
    const pendingFines = await Fine.countDocuments({
        member: transaction.member,
        status: 'pending'
    });

    if (pendingFines > 0) {
        return res.status(400).json({
            success: false,
            message: "Cannot renew. Member has unpaid fines"
        });
    }

    // ── 7. Extend dueDate from current dueDate (not today) ───────────
    const DEFAULT_LOAN_DAYS = parseInt(process.env.DEFAULT_LOAN_DAYS) || 14;
    const newDueDate = new Date(transaction.dueDate);
    newDueDate.setDate(newDueDate.getDate() + DEFAULT_LOAN_DAYS);

    // ── 8. Update transaction ─────────────────────────────────────────
    transaction.dueDate    = newDueDate;
    transaction.renewCount = transaction.renewCount + 1;
    transaction.status     = 'issued';
    await transaction.save();

    const populatedTransaction = await Transaction.findById(transaction._id)
        .populate('book',   'title isbn')
        .populate('member', 'name email membershipId');

    return res.status(200).json({
        success: true,
        message: `Book renewed successfully. New due date: ${newDueDate.toDateString()}`,
        data: populatedTransaction
    });
});

// ── GET OVERDUE BOOKS ─────────────────────────────────────────────────────
const getOverdueBooks = asyncHandler(async (req, res) => {
    const {
        page  = 1,
        limit = 10,
        sortBy = 'dueDate',
        order  = 'asc'      // oldest due date first
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;
    const sortObj  = { [sortBy]: order === 'asc' ? 1 : -1 };

    const query = {
        status:     'overdue',
        returnDate: null,
    };

    const [transactions, total] = await Promise.all([
        Transaction.find(query)
            .populate('book',   'title isbn coverImage')
            .populate('member', 'name email membershipId phone')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum),
        Transaction.countDocuments(query)
    ]);

    // calculate estimated fine for each overdue transaction
    const perDayRate = parseFloat(process.env.FINE_PER_DAY) || 2;
    const today      = new Date();

    const transactionsWithFine = transactions.map((t) => {
        const diffTime    = today - new Date(t.dueDate);
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const estimatedFine = daysOverdue * perDayRate;

        return {
            ...t.toObject(),
            daysOverdue,
            estimatedFine
        };
    });

    return res.status(200).json({
        success: true,
        data: transactionsWithFine,
        pagination: {
            total,
            page:        pageNum,
            limit:       limitNum,
            totalPages:  Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
        }
    });
});

// ── GET MY BORROWS (member self-service) ──────────────────────────────────
const getMyBorrows = asyncHandler(async (req, res) => {
    const {
        status,
        page  = 1,
        limit = 10,
        sortBy = 'createdAt',
        order  = 'desc'
    } = req.query;

    const query = { member: req.user._id };
    if (status) query.status = status;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;
    const sortObj  = { [sortBy]: order === 'asc' ? 1 : -1 };

    const [transactions, total] = await Promise.all([
        Transaction.find(query)
            .populate('book', 'title isbn coverImage author')
            .populate('fine', 'amount status daysOverdue')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum),
        Transaction.countDocuments(query)
    ]);

    return res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
            total,
            page:        pageNum,
            limit:       limitNum,
            totalPages:  Math.ceil(total / limitNum),
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
        }
    });
});

export {
    getAllTransactions,
    getTransactionById,
    issueBook,
    returnBook,
    renewBook,
    getOverdueBooks,
    getMyBorrows
}