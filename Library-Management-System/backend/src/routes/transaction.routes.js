import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
  getAllTransactions,
  getTransactionById,
  issueBook,
  returnBook,
  renewBook,
  getOverdueBooks,
  getMyBorrows
} from "../controllers/transaction.controller.js";

const transactionRoute = express.Router();

transactionRoute.get("/", verifyJWT, verifyRole("admin", "librarian"), getAllTransactions);

transactionRoute.get("/my", verifyJWT, verifyRole("member"), getMyBorrows);

transactionRoute.get("/overdue", verifyJWT, verifyRole("admin", "librarian"), getOverdueBooks);

transactionRoute.get(
  "/:id",
  verifyJWT,
  verifyRole("admin", "librarian"),
  getTransactionById
);

transactionRoute.post(
  "/issue",
  verifyJWT,
  verifyRole("admin", "librarian"),
  issueBook
);

transactionRoute.put(
  "/:id/return",
  verifyJWT,
  verifyRole("admin", "librarian"),
  returnBook
);

transactionRoute.put(
  "/:id/renew",
  verifyJWT,
  verifyRole("admin", "librarian"),
  renewBook
);

export default transactionRoute;
