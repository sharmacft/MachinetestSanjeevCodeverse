import bcrypt from "bcryptjs";
import adminModel from "../models/adminModel.js";
import masterModel from "../models/masterModel.js";
import { getTenantDb } from "../models/connectDb.js";
import { signToken } from "../middlewares/jwtToken.js";
import {
  ensureEmail,
  ensureMinLength,
  getStatusCode,
  requireFields,
} from "../utils/validation.js";

const DEFAULT_SUPERADMIN = {
  name: process.env.SUPERADMIN_NAME || "Super Admin",
  email: process.env.SUPERADMIN_EMAIL || "superadmin@example.com",
  password: process.env.SUPERADMIN_PASSWORD || "admin123",
};

const slugifyDbName = (value) => {
  return `tenant_${value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
};

const ensureSuperAdmin = async () => {
  const existingAdmin = await adminModel.findOne({ email: DEFAULT_SUPERADMIN.email });
  if (existingAdmin) {
    return existingAdmin;
  }

  const password = await bcrypt.hash(DEFAULT_SUPERADMIN.password, 10);
  return adminModel.create({
    name: DEFAULT_SUPERADMIN.name,
    email: DEFAULT_SUPERADMIN.email,
    password,
  });
};

export const adminLogin = async (req, res) => {
  try {
    await ensureSuperAdmin();
    requireFields(req.body, ["email", "password"]);
    const { email, password } = req.body;
    ensureEmail(email);
    ensureMinLength(password, 6, "password");
    const admin = await adminModel.findOne({ email: String(email).toLowerCase() });

    if (!admin) {
      return res.status(404).json({ message: "Superadmin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ id: admin._id, role: "superadmin" });
    res.status(200).json({
      message: "Superadmin login successful",
      token,
      defaultCredentials:
        email === DEFAULT_SUPERADMIN.email
          ? undefined
          : {
              email: DEFAULT_SUPERADMIN.email,
              password: DEFAULT_SUPERADMIN.password,
            },
    });
  } catch (error) {
    res.status(getStatusCode(error, 400)).json({ message: error.message });
  }
};

export const createMaster = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only superadmin can create masters" });
    }

    requireFields(req.body, ["name", "email", "password"]);
    const { name, email, password } = req.body;
    ensureEmail(email);
    ensureMinLength(password, 6, "password");
    const normalizedEmail = String(email).toLowerCase();
    const existingMaster = await masterModel.findOne({ email: normalizedEmail });

    if (existingMaster) {
      return res.status(409).json({ message: "Master already exists" });
    }

    const dbName = slugifyDbName(normalizedEmail.split("@")[0] || name);
    const hashPassword = await bcrypt.hash(password, 10);
    const master = await masterModel.create({
      name,
      email: normalizedEmail,
      password: hashPassword,
      dbName,
    });

    await getTenantDb(dbName);

    res.status(201).json({
      message: "Master created successfully",
      master: {
        id: master._id,
        name: master.name,
        email: master.email,
        dbName: master.dbName,
      },
    });
  } catch (error) {
    res.status(getStatusCode(error, 400)).json({ message: error.message });
  }
};

export const getMasters = async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Only superadmin can view masters" });
    }

    const masters = await masterModel.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(masters);
  } catch (error) {
    res.status(getStatusCode(error, 400)).json({ message: error.message });
  }
};
