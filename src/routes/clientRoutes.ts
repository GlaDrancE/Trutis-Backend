import { RequestHandler, Router } from 'express'
import { ClientLogin, CreateClient, DeleteClient, GetClient, GetClients, GetCoupons, SubPlans, UpdateClient, UpdateStaff, sendResetPasswordEmail, resetPassword, getQrId, fetchCustomerFromCoupon, updatePoints } from '../controllers/clientController';
import { upload } from '../utils/multer'
import Caching from '../utils/caching';
import { VerifyOtp, GenerateOtp } from '../controllers/otpController';
import Authenticator from '../middlewares/Authenticator';
import { CacheClient, CacheClients } from '../middlewares/Caching';

// import { CacheClient } from '../middlewares/Caching';
const clientRoutes = Router();

clientRoutes.get('/clients', Authenticator as RequestHandler, CacheClients as RequestHandler, GetClients as RequestHandler)
clientRoutes.get('/client/:id', Authenticator as RequestHandler, CacheClient as RequestHandler, GetClient as RequestHandler)

clientRoutes.post('/client/verify-otp', VerifyOtp as RequestHandler)
clientRoutes.get('/clients/subscription-plans', Authenticator as RequestHandler, SubPlans as RequestHandler)
clientRoutes.put('/clients/:id', Authenticator as RequestHandler, upload.single('logo'), UpdateClient as RequestHandler)
clientRoutes.delete('/clients/:id', Authenticator as RequestHandler, DeleteClient as RequestHandler)
clientRoutes.get('/forms/:id', Authenticator as RequestHandler, DeleteClient as RequestHandler)
export default clientRoutes;

// Coupons routes
clientRoutes.get("/clients/coupons/:id", Authenticator as RequestHandler, GetCoupons as RequestHandler)
clientRoutes.post("/coupon/verify", Authenticator as RequestHandler, fetchCustomerFromCoupon as RequestHandler)

// points
clientRoutes.post("/points/update", Authenticator as RequestHandler, updatePoints as RequestHandler)

// Staff routes
clientRoutes.post("/client/create-staff", Authenticator as RequestHandler, UpdateStaff as RequestHandler)

// OTP Routes
clientRoutes.post("/client/generate-otp", GenerateOtp as RequestHandler)
clientRoutes.post("/client/verify-otp", VerifyOtp as RequestHandler)


clientRoutes.post('/client/sendresetpassword', sendResetPasswordEmail as RequestHandler)
clientRoutes.post('/client/resetpassword', resetPassword as RequestHandler)
clientRoutes.post('/client/getqrid', getQrId as RequestHandler)
