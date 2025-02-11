import { RequestHandler, Router } from "express";
import { AdminLogin, AdminSignup } from "../controllers/adminController";
import { AgentLogin, CreateAgent } from "../controllers/agentController";
import { ClientLogin, CreateClient, CreateGoogleClient, CreateInitClient } from "../controllers/clientController";
import { upload } from '../utils/multer'
const authRoutes: Router = Router();

authRoutes.post("/admin/login", AdminLogin as RequestHandler);
authRoutes.post("/admin/signup", AdminSignup as RequestHandler);

authRoutes.post("/agent/login", AgentLogin as RequestHandler);
authRoutes.post("/agent/signup", CreateAgent as RequestHandler);


authRoutes.post('/client/login', ClientLogin as RequestHandler)
authRoutes.post('/clients/register', upload.single('logo'), CreateInitClient as RequestHandler)
authRoutes.post('/clients/google/register', CreateGoogleClient as RequestHandler)

export default authRoutes;
