import { RequestHandler, Router } from "express";
import { CreateAgent, DeleteAgent, ShowAgents, UpdateAgent, VerifyClient, linkQRCode, getAgentClients, getAgentProfile , updateAgentStatus} from "../controllers/agentController";
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
agentRoutes.post("/agents/linkQRCode", linkQRCode as RequestHandler)

agentRoutes.get("/agent-clients/:agentId", getAgentClients as RequestHandler);
agentRoutes.get("/agent/:agentId", getAgentProfile as RequestHandler);
agentRoutes.put("/agent/update-status/:agentId", updateAgentStatus as RequestHandler);

export default agentRoutes;
