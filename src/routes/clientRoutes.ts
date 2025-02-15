import { RequestHandler, Router } from 'express'
import { ClientLogin, CreateClient, DeleteClient, GetClient, GetClients, GetCoupons, SubPlans, UpdateClient } from '../controllers/clientController';
import { upload } from '../utils/multer'
import Caching from '../utils/caching';
import { VerifyOtp } from '../controllers/otpController';
// import { CacheClient } from '../middlewares/Caching';
const clientRoutes = Router();

clientRoutes.get('/clients', GetClients as RequestHandler)
clientRoutes.get('/client/:id', GetClient as RequestHandler)

clientRoutes.post('/client/verify-otp', VerifyOtp as RequestHandler)
clientRoutes.get('/clients/subscription-plans', SubPlans as RequestHandler)
clientRoutes.put('/clients/:id', upload.single('logo'), UpdateClient as RequestHandler)
clientRoutes.delete('/clients/:id', DeleteClient as RequestHandler)
clientRoutes.get('/forms/:id', DeleteClient as RequestHandler)
export default clientRoutes;

// Coupons routes

clientRoutes.get("/clients/coupons/:id", GetCoupons as RequestHandler)