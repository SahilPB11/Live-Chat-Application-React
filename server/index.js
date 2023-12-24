import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
export const app = express();
config({
  path: "./.env",
});
const jwtSecret = process.env.JWT_Secret;
// routes
app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    await jwt.sign({ userId: user._id }, jwtSecret).then((token) => {
      res.cookie("token", token).status(201).json("ok");
    });
  } catch (error) {
    console.log(error.message);
  }
});

// middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
