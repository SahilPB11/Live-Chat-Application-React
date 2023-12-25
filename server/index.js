import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import User from "./models/User.js";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import { WebSocketServer } from "ws";
import connectDB from "./ConnectDb/connectDb.js";
const app = express();
config({
  path: "./.env",
});

// middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
const jwtSecret = process.env.JWT_Secret;
const port = process.env.PORT;

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

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username }); // Using findOne is more appropriate for finding a single document
    if (!user) {
      return res
        .status(401)
        .send({ message: "User Not found. Please Register First." });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign({ userId: user._id, username }, jwtSecret);
      return res
        .cookie("token", token, { sameSite: "none", secure: true })
        .status(201)
        .json({
          _id: user._id,
        });
    } else {
      return res.status(401).send({ message: "Password is incorrect." });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: "Internal Server Error." });
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
    const hashPassword = bcrypt.hashSync(password, 10);
    user = await User.create({ username, password: hashPassword });
    const token = await jwt.sign({ userId: user._id, username }, jwtSecret);
    return res
      .cookie("token", token, { sameSite: "none", secure: true })
      .status(201)
      .json({
        _id: user._id,
      });
  } catch (error) {
    console.log(error.message);
  }
});

connectDB();
const server = app.listen(port, () =>
  console.log(`Server is Working on ${port}`)
);
const wss = new WebSocketServer({ server: server }); // Initialize WebSocket server

wss.on("connection", (connection, req) => {
  const cookies = req?.headers?.cookie;

  // read username and userid from the cookie for the conncection
  if (cookies) {
    const tokenCookieString = cookies
      .split("; ")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    if (recipient && text) {
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) => c.send(JSON.stringify({ text: text })));
    }
  });

  // notify everyone about online people when someone connects
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c?.userId,
          username: c?.username,
        })),
      })
    );
  });
});
