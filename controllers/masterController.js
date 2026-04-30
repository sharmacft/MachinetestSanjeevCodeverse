import masterModel from "../models/masterModel.js";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middlewares/jwtToken.js";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";

const generateAuthToken = (payload) => {
    return jwt.sign(payload, 'machin_test', { expiresIn: '1h' });
};
export const loginMaster = async (req, res) => {
    try {
        if (req.user.role !== 'master') {
            return res.status(403).json({ message: 'Access denied. Only masters can log in.' });
        }
        const { email, password } = req.body;
        const master = await masterModel.findOne({ email });
        if (!master) {
            return res.status(404).json({ message: 'Master not found' });
        }
        const isMatch = await bcrypt.compare(password, master.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateAuthToken({ id: master._id, role: 'master' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'master') {
            return res.status(403).json({ message: 'Access denied. Only admins and masters can create users.' });
        }
        const { name, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashPassword });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'master') {
            return res.status(403).json({ message: 'Access denied. Only admins and masters can view users.' });
        }
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const masterUserLogin = async (req, res) => {
    try {
        if (req.user.role !== 'master') {
            return res.status(403).json({ message: 'Access denied. Only masters can log in.' });
        }
        const { email, password } = req.body;
        const master = await masterModel.findOne({ email });
        if (!master) {
            return res.status(404).json({ message: 'Master not found' });
        }
        const isMatch = await bcrypt.compare(password, master.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateAuthToken({ id: master._id, role: 'master' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getMasterUserProfile = async (req, res) => {
    try {
        if (req.user.role !== 'master') {
            return res.status(403).json({ message: 'Access denied. Only masters can view their profile.' });
        }
        const master = await masterModel.findById(req.user.id).select('-password');
        res.status(200).json(master);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
