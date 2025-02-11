import express, { RequestHandler } from "express";
import cors from "cors";
import { json } from "body-parser";

import authRoutes from "./routes/authRoutes";
import agentRoutes from "./routes/agentRoutes";
import clientRoutes from "./routes/clientRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(json());
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173", process.env.FRONTEND_URL as string, 'http://localhost:5175'],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api", agentRoutes);
app.use("/api", adminRoutes);
app.use("/api", clientRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
