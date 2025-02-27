import * as dotenv from 'dotenv'
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') })
import express, { RequestHandler } from "express";
import cors from "cors";
import bodyParser, { json } from "body-parser";
// import "./jobs/cronJob"

import authRoutes from "./routes/authRoutes";
import agentRoutes from "./routes/agentRoutes";
import clientRoutes from "./routes/clientRoutes";
import adminRoutes from "./routes/adminRoutes";
import formRoutes from "./routes/formRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { webhook } from "./controllers/paymentController";

const app = express();
const PORT = process.env.PORT || 5000;
// app.use(
//   cors({
//     // origin: ["http://localhost:5174", "http://localhost:5173", process.env.FRONTEND_URL as string, 'http://localhost:5175'],
//     origin: '*',
//     credentials: true,
//   })
// );

app.use(cors({
  origin: 'https://trutisclient.vercel.app', // Allow frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies if needed
  allowedHeaders: 'Content-Type,Authorization'
}));

app.post("/api/webhook", bodyParser.raw({ type: 'application/json' }), webhook as RequestHandler)

app.use(json());
app.use(express.json({ limit: '50mb' })); // Increase the limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use("/api/auth", authRoutes);
app.use("/api", agentRoutes);
app.use("/api", adminRoutes);
app.use("/api", clientRoutes);
app.use("/api", formRoutes);
app.use("/api", paymentRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
