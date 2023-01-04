import express from "express";
import { PrismaClient } from "@prisma/client";
import createError from "http-errors";
import logger from "morgan";
import cors from "cors";

import imageRouter from "./routes/images.js";
import tokenRouter from "./routes/tokens.js";

export const prisma = new PrismaClient();
const app = express();

app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/images", imageRouter);
app.use("/api/tokens", tokenRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

export default app;
