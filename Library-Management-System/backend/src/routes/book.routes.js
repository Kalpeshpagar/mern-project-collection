import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyRole } from '../middlewares/role.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import {
    getAllBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    checkAvailability,
} from '../controllers/book.controller.js';

const bookRoute = express.Router();


// @access: librarian + admin
// upload.fields([...]) MUST come before verifyJWT so multer parses the multipart body
// first — otherwise req.body is empty and express 5 throws "next is not a function"
bookRoute.post(
    '/',
    upload.fields([{ name: 'coverImage', maxCount: 1 }]),
    verifyJWT,
    verifyRole('admin', 'librarian'),
    addBook
);

// @access: public
bookRoute.get('/', getAllBooks);
bookRoute.get('/:id', getBookById);
bookRoute.get('/:id/availability', checkAvailability);

bookRoute.put(
    '/:id',
    verifyJWT,
    verifyRole('admin', 'librarian'),
    upload.fields([{ name: 'coverImage', maxCount: 1 }]),
    updateBook
);

// @access: admin only
bookRoute.delete('/:id', verifyJWT, verifyRole('admin'), deleteBook);

export default bookRoute;
