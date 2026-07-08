import express from 'express';
import { verifyJWT }  from '../middlewares/auth.middleware.js';
import { verifyRole } from '../middlewares/role.middleware.js';
import {
    getAllAuthors,
    getAuthorById,
    createAuthor,
    updateAuthor,
    deleteAuthor,
} from '../controllers/author.controller.js';

const authorRoute = express.Router();

// @access: public — anyone can browse authors
authorRoute.get('/',    getAllAuthors);
authorRoute.get('/:id', getAuthorById);

// @access: librarian + admin — can create / edit authors
authorRoute.post('/',    verifyJWT, verifyRole('admin', 'librarian'), createAuthor);
authorRoute.put('/:id',  verifyJWT, verifyRole('admin', 'librarian'), updateAuthor);

// @access: admin only — can delete authors
authorRoute.delete('/:id', verifyJWT, verifyRole('admin'), deleteAuthor);

export default authorRoute;
