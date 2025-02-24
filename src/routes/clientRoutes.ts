import { RequestHandler, Router } from 'express'
<<<<<<< HEAD
import { ClientLogin, CreateClient, DeleteClient, GetClient, GetClients, GetCoupons, SubPlans, UpdateClient, UpdateStaff, sendResetPasswordEmail, resetPassword, getQrId, fetchCustomerFromCoupon, updatePoints } from '../controllers/clientController';
=======
import { ClientLogin, CreateClient, DeleteClient, CreateClientPublicKey, GetClient, GetClients, GetCoupons, SubPlans, UpdateClient, UpdateStaff, sendResetPasswordEmail, resetPassword, getQrId, fetchCustomerFromCoupon, updatePoints } from '../controllers/clientController';
>>>>>>> 703d4101190a89291feeb07e9bf0c321a27e14a6
import { upload } from '../utils/multer'
import Caching from '../utils/caching';
import { VerifyOtp, GenerateOtp } from '../controllers/otpController';

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
clientRoutes.post("/coupon/verify", fetchCustomerFromCoupon as RequestHandler)

// points
clientRoutes.post("/points/update", updatePoints as RequestHandler)

// Staff routes
clientRoutes.post("/client/create-staff", UpdateStaff as RequestHandler)

// OTP Routes
clientRoutes.post("/client/generate-otp", GenerateOtp as RequestHandler)
clientRoutes.post("/client/verify-otp", VerifyOtp as RequestHandler)


<<<<<<< HEAD
clientRoutes.post('/client/sendresetpassword', sendResetPasswordEmail as unknown as RequestHandler)
clientRoutes.post('/client/resetpassword', resetPassword as RequestHandler)
clientRoutes.post('/client/getqrid', getQrId as RequestHandler)
=======
clientRoutes.post('/client/sendresetpassword', sendResetPasswordEmail as RequestHandler)
clientRoutes.post('/client/resetpassword', resetPassword  as RequestHandler)
clientRoutes.post('/client/getqrid', getQrId  as RequestHandler)
>>>>>>> 703d4101190a89291feeb07e9bf0c321a27e14a6
