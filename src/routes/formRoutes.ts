import { RequestHandler, Router } from "express";
import { generatePoints, getCoupons, storeCustomers } from "../controllers/formsController";
import { upload } from '../utils/multer'

const formRoutes = Router();

formRoutes.post("/coupon", upload.single('reviewImage'), storeCustomers as RequestHandler);
formRoutes.post("/get-coupons", getCoupons as RequestHandler);
formRoutes.post("/generate-points", generatePoints as RequestHandler);
export default formRoutes;