import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
  getAllFines,
  getFineById,
  markFinePaid,
  waiveFine,
  getMyFines,
} from "../controllers/fine.controller.js";

const fineRoute = express.Router();

// @access: member
fineRoute.get("/my", verifyJWT, verifyRole("member"), getMyFines);

// @access: librarian + admin
fineRoute.get("/", verifyJWT, verifyRole("admin", "librarian"), getAllFines);
fineRoute.get("/:id", verifyJWT, verifyRole("admin", "librarian"), getFineById);
fineRoute.put(
  "/:id/pay",
  verifyJWT,
  verifyRole("admin", "librarian"),
  markFinePaid
);

// @access: admin only
fineRoute.put("/:id/waive", verifyJWT, verifyRole("admin"), waiveFine);

export default fineRoute;
