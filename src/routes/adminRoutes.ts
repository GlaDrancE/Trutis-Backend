import { Request, RequestHandler, Response, Router } from 'express'
import { GenerateQRCode, GetQRCodes } from '../controllers/adminController';
import Authenticator from '../middlewares/Authenticator';
// import { CacheQr } from '../middlewares/Caching';
const adminRoutes = Router();

adminRoutes.post("/qr-codes", Authenticator as RequestHandler, GenerateQRCode as RequestHandler)
adminRoutes.get("/qr-codes", Authenticator as RequestHandler, GetQRCodes as RequestHandler)

export default adminRoutes