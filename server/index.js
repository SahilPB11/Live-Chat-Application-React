import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import cors from "cors";
export const app = express();
config({
  path: "./.env",
});
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
const jwtSecret = process.env.JWT_Secret;
// middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// routes

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    const token = await jwt.sign({ userId: user._id }, jwtSecret);
    return res.cookie("token", token).status(201).json("ok");
  } catch (error) {
    console.log(error.message);
  }
});
