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
import Message from "./models/message.js";
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
const activeConnections = new Set();

// routes
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

async function getUserDatafromRequest(req) {
  try {
    const token = req?.cookies?.token;
    if (token) {
      const userData = jwt.verify(token, jwtSecret);
      if (!userData) return "no token";
      else return userData;
    }
  } catch (error) {
    return error.message;
  }
}

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/messages/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = await getUserDatafromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    return res.status(200).send(messages);
  } catch (error) {
    console.log(error.message);
    res.json(400).send(error);
  }
});

app.get("/people", async (req, res) => {
  try {
    const users = await User.find({}, { _id: 1, username: 1 });
    return res.send(users);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ message: "Internal Server Error." });
  }
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

app.post("/logout", (req, res) => {
  const token = req?.cookies?.token;

  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;

      const userId = userData.userId;

      // Find the WebSocket connection associated with the user and terminate it
      for (const connection of activeConnections) {
        if (connection.userId === userId) {
          connection.terminate(); // Terminate the WebSocket connection
          activeConnections.delete(connection); // Remove the connection from the set
          break; // Exit the loop once the connection is found and terminated
        }
      }
    });
  }
  // Clear the token cookie
  return res
    .cookie("token", "", { sameSite: "none", secure: true })
    .status(200)
    .json("Logged out successfully");
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
    const token = jwt.sign({ userId: user._id, username }, jwtSecret);
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
  connection.isAlive = true;

  // Add the connection to the set of active connections
  // here i am adding the conection who is coming online
  activeConnections.add(connection);

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setTimeout(() => {
      connection.isAlive = false;
      clearInterval(connection.timer);
      connection.terminate();
      console.log("dead");
      notifyAboutOnlinePeople();
    }, 1000);
  }, 5000);

  connection.on("pong", () => {
    clearTimeout(connection.deathTimer);
  });

  // this function for sending the active online users users 
  function notifyAboutOnlinePeople() {
    const activeClients = [...wss.clients].filter((client) => client.isAlive);
    const onlineUsers = activeClients.map((c) => ({
      userId: c.userId,
      username: c.username,
    }));
    activeClients.forEach((client) => {
      client.send(JSON.stringify({ online: onlineUsers }));
    });
  }

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

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    if (recipient && text) {
      const messageDocument = await Message.create({
        sender: connection?.userId,
        recipient: recipient,
        text: text,
      });
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text: text,
              sender: connection?.userId,
              recipient,
              _id: messageDocument._id,
            })
          )
        );
    }
  });

  // notify everyone about online people when someone connects
  notifyAboutOnlinePeople();
});
