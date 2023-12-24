import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";

export const app = express();
config({
  path: "./.env",
});

// routes
app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post('/register', (req, res) => {
    
})

// middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
