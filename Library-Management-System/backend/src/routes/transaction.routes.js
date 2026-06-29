import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { verifyRole } from "../middlewares/role.middleware";
import { get } from "mongoose";

const transactionRoute = express.Router();

transactionRoute.get("/ ", verifyJWT, verifyRole("admin", "librarian"));

transactionRoute.get("( /my      ", verifyJWT, verifyRole("member"));

transactionRoute.get(
  "/:id       ",
  verifyJWT,
  verifyRole("admin", "librarian")
);

transactionRoute.post(
  "/issue     ",
  verifyJWT,
  verifyRole("admin", "librarian")
);

transactionRoute.put(
  "/:id/return",
  verifyJWT,
  verifyRole("admin", "librarian")
);

transactionRoute.put(
  "/:id/renew ",
  verifyJWT,
  verifyRole("admin", "librarian")
);

export default transactionRoute;
