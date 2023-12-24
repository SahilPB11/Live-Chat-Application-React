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

// middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const jwtSecret = process.env.JWT_Secret;

// routes
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    const token = await jwt.sign({ userId: user._id }, jwtSecret);
    return res.cookie("token", token).status(201).json({
      _id: user._id,
    });
  } catch (error) {
    console.log(error.message);
  }
});
