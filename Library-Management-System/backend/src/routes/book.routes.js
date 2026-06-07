import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyRole } from '../middlewares/role.middleware.js';
import {
    getAllBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    checkAvailability,
} from '../controllers/book.controller.js';

const bookRoute = express.Router();

// @access: public
bookRoute.get('/',                getAllBooks);
bookRoute.get('/:id',             getBookById);
bookRoute.get('/:id/availability',checkAvailability);

// @access: librarian + admin
bookRoute.post('/',    verifyJWT, verifyRole('admin', 'librarian'), addBook);
bookRoute.put('/:id',  verifyJWT, verifyRole('admin', 'librarian'), updateBook);

// @access: admin only
bookRoute.delete('/:id', verifyJWT, verifyRole('admin'), deleteBook);

export default bookRoute;