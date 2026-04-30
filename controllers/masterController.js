import bcrypt from "bcryptjs";
import masterModel from "../models/masterModel.js";
import { getTenantDb } from "../models/connectDb.js";
import { getTenantUserModel } from "../models/userModel.js";
import { signToken } from "../middlewares/jwtToken.js";
import {
  ensureEmail,
  ensureMinLength,
  getStatusCode,
  requireFields,
} from "../utils/validation.js";

const getTenantUserContext = async (master) => {
  const tenantDb = await getTenantDb(master.dbName);
  const TenantUser = getTenantUserModel(tenantDb);
  return { tenantDb, TenantUser };
};

export const loginMaster = async (req, res) => {
  try {
    requireFields(req.body, ["email", "password"]);
    const { email, password } = req.body;
    ensureEmail(email);
    ensureMinLength(password, 6, "password");
    const master = await masterModel.findOne({ email: String(email).toLowerCase() });

    if (!master) {
      return res.status(404).json({ message: "Master not found" });
    }

    const isMatch = await bcrypt.compare(password, master.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: master._id,
      role: "master",
      dbName: master.dbName,
    });

    res.status(200).json({
      message: "Master login successful",
      token,
      master: {
        id: master._id,
        name: master.name,
        email: master.email,
        dbName: master.dbName,
      },
    });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    if (req.user.role !== "master") {
      return res.status(403).json({ message: "Only masters can create tenant users" });
    }

    requireFields(req.body, ["name", "email", "password"]);
    const master = await masterModel.findById(req.user.id);
    if (!master) {
      return res.status(404).json({ message: "Master not found" });
    }

    const { name, email, password } = req.body;
    ensureEmail(email);
    ensureMinLength(password, 6, "password");
    const { TenantUser } = await getTenantUserContext(master);
    const normalizedEmail = String(email).toLowerCase();
    const existingUser = await TenantUser.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "Tenant user already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await TenantUser.create({
      name,
      email: normalizedEmail,
      password: hashPassword,
      masterId: master._id,
    });

    res.status(201).json({
      message: "Tenant user created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(getStatusCode(error, 400)).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "master") {
      return res.status(403).json({ message: "Only masters can view tenant users" });
    }

    const master = await masterModel.findById(req.user.id);
    if (!master) {
      return res.status(404).json({ message: "Master not found" });
    }

    const { TenantUser } = await getTenantUserContext(master);
    const users = await TenantUser.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(getStatusCode(error, 400)).json({ message: error.message });
  }
};

export const masterUserLogin = async (req, res) => {
  try {
    requireFields(req.body, ["masterId", "email", "password"]);
    const { masterId, email, password } = req.body;
    ensureEmail(email);
    ensureMinLength(password, 6, "password");
    const master = await masterModel.findById(masterId);

    if (!master) {
      return res.status(404).json({ message: "Master not found" });
    }

    const { TenantUser } = await getTenantUserContext(master);
    const user = await TenantUser.findOne({ email: String(email).toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: user._id,
      role: "master_user",
      masterId: master._id,
      dbName: master.dbName,
    });

    res.status(200).json({
      message: "Master user login successful",
      token,
    });
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({ message: error.message });
  }
};

export const getMasterUserProfile = async (req, res) => {
  try {
    if (req.user.role !== "master_user") {
      return res.status(403).json({ message: "Only master users can view this profile" });
    }

    const tenantDb = await getTenantDb(req.user.dbName);
    const TenantUser = getTenantUserModel(tenantDb);
    const user = await TenantUser.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(getStatusCode(error, 500)).json({ message: error.message });
  }
};
