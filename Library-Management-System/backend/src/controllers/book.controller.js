import mongoose from "mongoose";
import { Book } from "../models/book.model.js";
import { Author } from "../models/author.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// GET ALL BOOKS
const getAllBooks = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    language,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = { isActive: true }; // always exclude soft-deleted books

  // SEARCH — partial, case-insensitive match on title
  if (search) {
    query.title = { $regex: search, $options: "i" };
    // $regex: matches any title containing the search string
    // $options: 'i' means case-insensitive (Atomic = atomic = ATOMIC)
  }

  // FILTER — exact match, only added if param was sent
  if (category) query.category = category;
  if (language) query.language = language;

  const pageNum = Math.max(1, parseInt(page)); // ensure page >= 1
  const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // clamp: 1–50
  const skip = (pageNum - 1) * limitNum;

  const sortOrder = order === "asc" ? 1 : -1;
  const sortObj = { [sortBy]: sortOrder };
  // e.g. sortBy='title'&order='asc' → { title: 1 }

  const [books, total] = await Promise.all([
    Book.find(query)
      .populate("author", "name country")
      .populate("category", "name")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select("-__v"), // hide internal mongoose field

    Book.countDocuments(query), // total matching docs (ignoring pagination)
  ]);

  return res.status(200).json({
    success: true,
    data: books,
    pagination: {
      total, // e.g. 137 books match
      page: pageNum, // current page
      limit: limitNum, // per page
      totalPages: Math.ceil(total / limitNum), // e.g. ceil(137/10) = 14
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
});

// GET BOOK BY ID
const getBookById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const book = await Book.findById(id)
    .populate("author", "name country bio")
    .populate("category", "name description");

  if (!book || !book.isActive) {
    return res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: book,
  });
});

// ADD BOOK
const addBook = asyncHandler(async (req, res) => {
  const {
    title,
    author,
    isbn,
    category,
    publisher,
    publishedYear,
    description,
    totalCopies,
    language,
    pages,
    location,
    tags,
  } = req.body;

  // 1. Required field validation
  if (!title || !author || !isbn || !totalCopies) {
    return res.status(400).json({
      success: false,
      message: "Title, author, ISBN and totalCopies are required",
    });
  }

  // 2. Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(author)) {
    return res.status(400).json({
      success: false,
      message: "Invalid author ID",
    });
  }

  if (category && !mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  // 3. Check author actually exists in DB
  const authorExists = await Author.findById(author);
  if (!authorExists) {
    return res.status(404).json({
      success: false,
      message: "Author not found",
    });
  }

  // 4. Check duplicate ISBN
  const existingBook = await Book.findOne({ isbn });
  if (existingBook) {
    return res.status(409).json({
      success: false,
      message: "A book with this ISBN already exists",
    });
  }

  // 5.cover image upload
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // 6. Create the book
  const book = await Book.create({
    title,
    author,
    isbn,
    category,
    publisher,
    publishedYear,
    description,
    totalCopies,
    language,
    pages,
    location,
    tags,
    coverImage: coverImage?.url || "",
  });

  // 7. Return populated response
  const populatedBook = await Book.findById(book._id)
    .populate("author", "name country")
    .populate("category", "name");

  return res.status(201).json({
    success: true,
    message: "Book added successfully",
    data: populatedBook,
  });
});

// UPDATE BOOK
const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid book ID",
    });
  }

  // 2. Check book exists and is active
  const book = await Book.findById(id);
  if (!book || !book.isActive) {
    return res.status(404).json({
      success: false,
      message: "Book not found",
    });
  }

  const {
    title,
    author,
    isbn,
    category,
    publisher,
    publishedYear,
    description,
    totalCopies,
    language,
    pages,
    location,
    tags,
  } = req.body;

  //  3. Validate author if being updated
  if (author) {
    if (!mongoose.Types.ObjectId.isValid(author)) {
      return res.status(400).json({
        success: false,
        message: "Invalid author ID",
      });
    }
    const authorExists = await Author.findById(author);
    if (!authorExists) {
      return res.status(404).json({
        success: false,
        message: "Author not found",
      });
    }
  }

  //  4. Validate category if being updated
  if (category && !mongoose.Types.ObjectId.isValid(category)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  // 5. Check duplicate ISBN if ISBN is being changed
  if (isbn && isbn !== book.isbn) {
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }
  }

  // 6. Handle totalCopies change
  let updatedAvailableCopies = book.availableCopies;
  if (totalCopies !== undefined) {
    const diff = totalCopies - book.totalCopies;
    // e.g. totalCopies 5 → 7 means 2 new copies added, availableCopies +2
    // e.g. totalCopies 5 → 3 means 2 copies removed, availableCopies -2
    updatedAvailableCopies = book.availableCopies + diff;

    // availableCopies can never go below 0
    // (can't remove copies that are currently issued)
    if (updatedAvailableCopies < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce total copies. ${book.totalCopies - book.availableCopies} copies are currently issued out`,
      });
    }

    // availableCopies can never exceed totalCopies
    if (updatedAvailableCopies > totalCopies) {
      return res.status(400).json({
        success: false,
        message: "Available copies cannot exceed total copies",
      });
    }
  }

  // 7. Handle cover image update
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // 8. Build update object — only include fields that were sent
  const updateFields = {
    ...(title !== undefined && { title }),
    ...(author !== undefined && { author }),
    ...(isbn !== undefined && { isbn }),
    ...(category !== undefined && { category }),
    ...(publisher !== undefined && { publisher }),
    ...(publishedYear !== undefined && { publishedYear }),
    ...(description !== undefined && { description }),
    ...(language !== undefined && { language }),
    ...(pages !== undefined && { pages }),
    ...(location !== undefined && { location }),
    ...(tags !== undefined && { tags }),
    ...(totalCopies !== undefined && {
      totalCopies,
      availableCopies: updatedAvailableCopies,
    }),
    ...(coverImage?.url && { coverImage: coverImage.url }),
  };

  // 9. Apply update
  const updatedBook = await Book.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  )
    .populate("author", "name country")
    .populate("category", "name");

  return res.status(200).json({
    success: true,
    message: "Book updated successfully",
    data: updatedBook,
  });
});

// DELETE BOOK (soft delete) 
const deleteBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Validate ObjectId 
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid book ID"
        });
    }

    // 2. Check book exists 
    const book = await Book.findById(id);
    if (!book || !book.isActive) {
        return res.status(404).json({
            success: false,
            message: "Book not found"
        });
    }

    // 3. Block delete if copies are currently issued 
    const issuedCopies = book.totalCopies - book.availableCopies;
    if (issuedCopies > 0) {
        return res.status(400).json({
            success: false,
            message: `Cannot delete book. ${issuedCopies} ${issuedCopies === 1 ? 'copy is' : 'copies are'} currently issued out`
        });
    }

    // 4. Soft delete — never hard delete 
    await Book.findByIdAndUpdate(id, { $set: { isActive: false } });

    return res.status(200).json({
        success: true,
        message: "Book deleted successfully"
    });
});

// CHECK AVAILABILITY 
const checkAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid book ID"
        });
    }

    // 2. Fetch only the fields we need 
    const book = await Book.findById(id)
        .select('title totalCopies availableCopies isActive');

    if (!book || !book.isActive) {
        return res.status(404).json({
            success: false,
            message: "Book not found"
        });
    }

    const issuedCopies = book.totalCopies - book.availableCopies;
    const isAvailable  = book.availableCopies > 0;

    return res.status(200).json({
        success: true,
        data: {
            title:           book.title,
            totalCopies:     book.totalCopies,
            availableCopies: book.availableCopies,
            issuedCopies,
            isAvailable,
            // frontend uses this to show "Borrow" or "Reserve" button
            status: isAvailable ? 'available' : 'all copies issued'
        }
    });
});

export {
    getAllBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    checkAvailability
}
