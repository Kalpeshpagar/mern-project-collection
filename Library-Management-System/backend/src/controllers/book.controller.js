import { Book } from "../models/book.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"

const getAllBooks = asyncHandler(async (req, res) => {

    const {
        search,
        category,
        language,
        page  = 1,        
        limit = 10,      
        sortBy = 'createdAt',
        order  = 'desc'
    } = req.query;

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

    const pageNum  = Math.max(1, parseInt(page));   // ensure page >= 1
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // clamp: 1–50
    const skip     = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj   = { [sortBy]: sortOrder };
    // e.g. sortBy='title'&order='asc' → { title: 1 }

    const [books, total] = await Promise.all([
        Book.find(query)
            .populate('author',   'name country')   
            .populate('category', 'name')            
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum)
            .select('-__v'),                         // hide internal mongoose field

        Book.countDocuments(query)  // total matching docs (ignoring pagination)
    ]);

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

