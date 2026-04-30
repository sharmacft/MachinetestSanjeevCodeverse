import express from "express";
import { authenticateToken } from "../middlewares/jwtToken.js";
import {
  createData,
  deleteData,
  getAllData,
  getDataById,
  updateData,
} from "../controllers/dataController.js";

const router = express.Router();

router.post("/", authenticateToken, createData);
router.get("/", authenticateToken, getAllData);
router.get("/:id", authenticateToken, getDataById);
router.put("/:id", authenticateToken, updateData);
router.delete("/:id", authenticateToken, deleteData);

export default router;
