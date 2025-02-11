import { RequestHandler, Router } from "express";
import { CreateAgent, DeleteAgent, ShowAgents, UpdateAgent, VerifyClient, VerifyQRID } from "../controllers/agentController";
import multer from "multer";
import Authenticator from "../middlewares/Authenticator";
// import { CacheAgent } from "../middlewares/Caching";
const agentRoutes: Router = Router();

const upload = multer();
agentRoutes.post(
  "/agents",
  // upload.single("profile"),
  CreateAgent as RequestHandler
);
agentRoutes.delete(
  "/agents/:id",
  Authenticator as RequestHandler,
  DeleteAgent as RequestHandler
);
agentRoutes.get(
  "/agents",
  // Authenticator as RequestHandler,
  ShowAgents as RequestHandler
);
agentRoutes.put(
  "/agents/:id",
  Authenticator as RequestHandler,
  UpdateAgent as RequestHandler
)
agentRoutes.get("/agents/client/:id", VerifyClient as RequestHandler)
agentRoutes.post("/agents/verifyClient", VerifyQRID as RequestHandler)
export default agentRoutes;
