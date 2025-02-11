import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Validator } from "../middlewares/validator";
import { generateRandom } from "../utils/generateRand";
import redisClient from "../utils/caching";


interface ReqRes {
  req: Request,
  res: Response
}
const JWT_SECRET = process.env.JWT_SECRET || null;
export const AdminLogin = async (
  req: Request, res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Invalid Request");
    }
    const user = await prisma.admin.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid Credentials");
    }
    if (JWT_SECRET === null) {
      return res.status(500).send("Internal Server Error");
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

export const AdminSignup = async (
  req: Request, res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Invalid Request");
    }
    const data = {
      email,
      password,
      // name,
    };
    const validateData = Validator.validateAdmin(data);
    if (!validateData) {
      return res.status(400).send("Invalid Request");
    }
    const newUser = await prisma.admin.create({
      data: {
        email: email,
        password: await bcrypt.hash(password, 10),
        // name: name,
      },
    });
    if (!newUser) {
      return res.status(500).send("Internal Server Error");
    }
    res.status(201).send("User Created");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};




export const GenerateQRCode = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { id, amount } = req.body;
    if (!id) {
      return res.status(400).send("Invalid request")
    }
    const privateId = id + generateRandom(4)
    const client = await prisma.qRCodes.create({
      data: {
        public_key: id,
        private_key: privateId,
      }
    })
    if (!client) {
      return res.status(500).send("Something went wrong, QR is not generated")
    }
    console.log(client)
    res.status(201).send("QR Code generated")
  } catch (error) {
    res.status(500).send("Internal Server REror")
  }
}

export const GetQRCodes = async (req: Request, res: Response) => {
  try {
    const qrCodes = await prisma.qRCodes.findMany();
    if (!qrCodes) {
      return res.status(404).send("QR Codes not found")
    }
    // await redisClient.set('qrCodes', JSON.stringify(qrCodes))
    res.status(200).json(qrCodes)
  } catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error")
  }
}