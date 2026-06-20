import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { verifyRole } from "../middlewares/role.middleware";

const memberRoute = express.Router();

memberRoute.get("/members", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.get("/members/:id", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.post("/members", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.put("/members/:id  ", verifyJWT, verifyRole("admin", "librarian"));

memberRoute.delete("/members/:id   ", verifyJWT, verifyRole("admin"));

memberRoute.get(
  "/members/:id/history ",
  verifyJWT,
  verifyRole("admin", "librarian")
);
