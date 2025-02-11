import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: any = process.env.JWT_SECRET;

const Authenticator = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.split(' ')[1];
    if (!token) {
      return res.status(401).send("Unauthorized");
    }
    const decode = jwt.verify(token, JWT_SECRET);
    if (!decode) {
      return res.status(401).send("Unauthorized");
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export default Authenticator;
