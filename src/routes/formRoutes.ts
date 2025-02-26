import { RequestHandler, Router } from "express";
import { generatePoints, getClient, getCoupons, redeemCoupon, storeCustomers } from "../controllers/formsController";
import { upload } from '../utils/multer'

const formRoutes = Router();

formRoutes.post("/coupon", upload.single('reviewImage'), storeCustomers as RequestHandler);
formRoutes.get("/forms/get-coupons/:client_id", getCoupons as RequestHandler);
formRoutes.post("/generate-points", generatePoints as RequestHandler);
formRoutes.post("/forms/get-client", getClient as RequestHandler);
formRoutes.post("/forms/redeem-coupon", redeemCoupon as RequestHandler);
export default formRoutes;