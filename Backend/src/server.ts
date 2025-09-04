// src/server.ts
import express from "express";
import { z } from "zod";
import { userModel } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const SECRET = process.env.SECRET || "secret";

/**
 * Signup
 */
app.post("/api/v1/signup", async (req, res) => {
  const schema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100)
  }).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ status: 400, message: "Invalid input", errors: parse.error.issues });
  }
  const { username, password } = parse.data;

  try {
    const exists = await userModel.findOne({ username });
    if (exists) return res.status(409).json({ status: 409, message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new userModel({ username, password: hashed });
    await newUser.save();

    return res.status(201).json({ status: 201, message: "Signup successful", data: { username: newUser.username } });
  } catch (err) {
    console.error("Error during signup:", err);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * Signin
 */
app.post("/api/v1/signin", async (req, res) => {
  const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(1)
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ status: 400, message: "Invalid input", errors: parse.error.issues });
  }
  const { username, password } = parse.data;
  try {
    const user = await userModel.findOne({ username });
    if (!user) return res.status(401).json({ status: 401, message: "Username is incorrect" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: 401, message: "Password is incorrect" });

    const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: "1h" });

    return res.status(200).json({ status: 200, message: "Signin successful", data: { username: user.username }, token });
  } catch (err) {
    console.error("Error during signin:", err);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
});

/**
 * Signout - (stateless JWT): client should delete token.
 * Here we simply verify token and respond success (optional).
 */
app.post("/api/v1/signout", authMiddleware, async (req, res) => {
  // If you want server-side token revocation, maintain a blacklist (redis).
  return res.status(200).json({ status: 200, message: "Signout successful" });
});

/**
 * Protected example route
 */
app.get("/api/v1/me", authMiddleware, (req, res) => {
  return res.json({ status: 200, user: req.user || null });
});

app.get("/", (_req, res) => res.send("API running"));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
