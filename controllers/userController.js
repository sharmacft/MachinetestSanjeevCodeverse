import bcrypt from "bcryptjs";
import { PublicUser } from "../models/userModel.js";
import { signToken } from "../middlewares/jwtToken.js";

export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase();
    const existingUser = await PublicUser.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await PublicUser.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "public_user",
    });

    res.status(201).json({
      message: "Public user created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await PublicUser.findOne({
      email: String(email).toLowerCase(),
      role: "public_user",
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ id: user._id, role: user.role });
    res.status(200).json({ message: "Public user login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    if (req.user.role !== "public_user") {
      return res.status(403).json({ message: "Only public users can access this profile" });
    }

    const user = await PublicUser.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
