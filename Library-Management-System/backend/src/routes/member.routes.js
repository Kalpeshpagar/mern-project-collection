import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js";
import {
    createMember,
    getAllMembers,
    getMemberById,
    updateMember,
    deactivateMember,
    getMemberHistory
} from "../controllers/member.controller.js";

const memberRoute = express.Router();

memberRoute.get("", verifyJWT, verifyRole("admin", "librarian"), getAllMembers);

memberRoute.get("/:id", verifyJWT, verifyRole("admin", "librarian"), getMemberById);

memberRoute.post("", verifyJWT, verifyRole("admin", "librarian"), createMember);

memberRoute.put("/:id", verifyJWT, verifyRole("admin", "librarian"), updateMember);

memberRoute.delete("/:id", verifyJWT, verifyRole("admin"), deactivateMember);

memberRoute.get(
  "/:id/history",
  verifyJWT,
  verifyRole("admin", "librarian"),
  getMemberHistory
);

export default memberRoute;
