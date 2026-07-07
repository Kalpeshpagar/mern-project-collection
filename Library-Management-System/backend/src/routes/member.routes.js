import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";

const memberRoute = express.Router();

memberRoute.get("", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.get("/:id", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.post("", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.put("/:id  ", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.delete("/:id   ", verifyJWT, verifyRole("admin"));

memberRoute.get(
  "/:id/history ",
  verifyJWT,
  verifyRole("admin", "librarian")
);

export default memberRoute
