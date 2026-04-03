/**
 * Server file, defines all routes to connect the frontend to the database
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import loginRouter from "./routes/login";
import requestRouter from "./routes/request";
import locationRouter from "./routes/location";
import { authenticate } from "../middleware/authenticate";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"], // which HTTP methods to allow
    allowedHeaders: ["Content-Type", "Authorization"], // Authorization needed later for auth tokens
  }),
);

app.use(express.json());

// mounts routes 

app.use("/api/login", loginRouter);
app.use("/api/request", authenticate, requestRouter);
app.use("/api/location", authenticate, locationRouter);


const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("server running on ", PORT);
});

export default app;
