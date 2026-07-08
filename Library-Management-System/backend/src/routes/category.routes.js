import express from 'express';
import { verifyJWT }  from '../middlewares/auth.middleware.js';
import { verifyRole } from '../middlewares/role.middleware.js';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller.js';

const categoryRoute = express.Router();

// @access: public — anyone can browse categories
categoryRoute.get('/',    getAllCategories);
categoryRoute.get('/:id', getCategoryById);

// @access: librarian + admin — can create / edit categories
categoryRoute.post('/',    verifyJWT, verifyRole('admin', 'librarian'), createCategory);
categoryRoute.put('/:id',  verifyJWT, verifyRole('admin', 'librarian'), updateCategory);

// @access: admin only — can delete categories
categoryRoute.delete('/:id', verifyJWT, verifyRole('admin'), deleteCategory);

export default categoryRoute;
