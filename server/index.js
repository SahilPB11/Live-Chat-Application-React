import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";

export const app = express();
config({
  path: "./.env",
});

// middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());