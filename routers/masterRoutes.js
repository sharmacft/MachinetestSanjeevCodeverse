import express from "express";
import {
  loginMaster,
  createUser,
  getUsers,
  masterUserLogin,
  getMasterUserProfile,
} from "../controllers/masterController.js";
const router = express.Router();
import { authenticateToken } from "../middlewares/jwtToken.js";

router.post("/login", loginMaster);
router.post("/user", authenticateToken, createUser);
router.get("/users", authenticateToken, getUsers);
router.post("/user/login", masterUserLogin);
router.get("/user/profile", authenticateToken, getMasterUserProfile);

export default router;
