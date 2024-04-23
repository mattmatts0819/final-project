import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/userRoutes.js";
import blogRouter from "./routes/blogRoutes.js";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url); // get resolved path to the file
const __dirname = path.dirname(__filename); // get name of the directory

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/IST256Solo2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoCreate: true,
  })
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.error("error connecting to mongodb", err);
  });

app.use("/users", userRouter);
app.use("/blogs", blogRouter);
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(
  express.static(path.join(__dirname, "frontend"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/frontend/index.html"));
});

app.listen(port, () => {
  console.log("server is running");
});
