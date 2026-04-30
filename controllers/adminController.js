import adminModel from "../models/adminModel.js";
import masterModel from "../models/masterModel.js";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middlewares/jwtToken.js";
import bcrypt from "bcryptjs";

const generateAuthToken = (payload) => {
    return jwt.sign(payload, 'machin_test', { expiresIn: '1h' });
};

export const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const admin = new adminModel({ name, email, password: hashPassword });
        await admin.save();
        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const adminLogin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can log in.' });
        }
        const { email, password } = req.body;
        const admin = await adminModel.findOne({ email });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const token = generateAuthToken({ id: admin._id, role: 'admin' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const createMaster = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can create masters.' });
        }
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const master = new masterModel({ name, email, password: hashPassword });
        await master.save();
        res.status(201).json(master);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const getMasters = async (req, res) => {
    try {
        const masters = await masterModel.find();
        res.status(200).json(masters);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
