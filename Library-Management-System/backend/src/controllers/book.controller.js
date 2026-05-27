import { Book } from "../models/book.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"

const getAllBooks = asyncHandler(async (req, res) => {

    // ── 1. Extract query params (with safe defaults) ──────────────────
    const {
        search,
        category,
        language,
        page  = 1,        // default: first page
        limit = 10,       // default: 10 books per page
        sortBy = 'createdAt',
        order  = 'desc'
    } = req.query;

    // ── 2. Build the filter object ────────────────────────────────────
    const query = { isActive: true };  // always exclude soft-deleted books

    // SEARCH — partial, case-insensitive match on title
    if (search) {
        query.title = { $regex: search, $options: 'i' };
        // $regex: matches any title containing the search string
        // $options: 'i' means case-insensitive (Atomic = atomic = ATOMIC)
    }

    // FILTER — exact match, only added if param was sent
    if (category) query.category = category;
    if (language) query.language = language;

    // ── 3. Pagination math ────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page));   // ensure page >= 1
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // clamp: 1–50
    const skip     = (pageNum - 1) * limitNum;
    // page=1 → skip 0  (show books 1–10)
    // page=2 → skip 10 (show books 11–20)
    // page=3 → skip 20 (show books 21–30)

    // ── 4. Sort ───────────────────────────────────────────────────────
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj   = { [sortBy]: sortOrder };
    // e.g. sortBy='title'&order='asc' → { title: 1 }

    // ── 5. Run both queries in parallel (faster than sequential) ──────
    const [books, total] = await Promise.all([
        Book.find(query)
            .populate('author',   'name country')    // only fetch name & country from Author
            .populate('category', 'name')            // only fetch name from Category
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .select('-__v'),                         // hide internal mongoose field

        Book.countDocuments(query)  // total matching docs (ignoring pagination)
        // needed so frontend knows: "Page 2 of 14"
    ]);

    // ── 6. Send response with pagination meta ─────────────────────────
    return res.status(200).json({
        success: true,
        data: books,
        pagination: {
            total,                                        // e.g. 137 books match
            page:       pageNum,                          // current page
            limit:      limitNum,                         // per page
            totalPages: Math.ceil(total / limitNum),      // e.g. ceil(137/10) = 14
            hasNextPage: pageNum < Math.ceil(total / limitNum),
            hasPrevPage: pageNum > 1
        }
    });
});

const getBookById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const book = await Book.findById(id)
        .populate('author', 'name country bio')
        .populate('category', 'name description');

    if (!book || !book.isActive) {
        return res.status(404).json({
            success: false,
            message: "Book not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: book
    });
});

