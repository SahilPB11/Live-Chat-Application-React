import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
export const app = express();
config({
  path: "./.env",
});

// middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
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

app.get("/profile", (req, res) => {
  const token = req?.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json({
        userData,
      });
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.find({ username });
    if (user.length > 0)
      return res
        .status(400)
        .send({ message: "user already exist please log in" });
    user = await User.create({ username, password });
    const token = await jwt.sign({ userId: user._id }, jwtSecret);
    return res
      .cookie("token", token, { sameSite: "none", secure: true })
      .status(201)
      .json({
        _id: user._id,
        username,
      });
  } catch (error) {
    console.log(error.message);
  }
});
