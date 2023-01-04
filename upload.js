import { config } from "./config.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: { fileSize: config.maxImageSize, files: 1 }
});
