import { Request, Response } from "express";
import prisma from "../db/prisma";
import bcrypt from 'bcryptjs'

import jwt from 'jsonwebtoken';
import { Validator } from "../middlewares/validator";
import redisClient from "../utils/caching";



// Make sure TOKEN_SECRET is defined in your environment
const tokenSecret = process.env.JWT_SECRET || null;
if (!tokenSecret) {
  throw new Error('TOKEN_SECRET environment variable is not defined.');
}
export const AgentLogin = async (req: Request, res: Response) => {

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find the agent by email
    const agent = await prisma.agent.findUnique({
      where: { email }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found.' });
    }
    // Validate the password using bcrypt (assuming agent.password is hashed)
    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: agent.id, email: agent.email },
      tokenSecret,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

export const CreateAgent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, address, phone, type_of_employment, profile } = req.body;
    if (!name || !email || !password || !address || !phone || !type_of_employment) {
      return res.status(400).send("Invalid Request");
    }
    const agentExists = await prisma.agent.findUnique({ where: { email } });
    if (agentExists) {
      return res.status(400).send("Agent already exists");
    }
    const data = {
      name,
      email,
      password,
      address,
      profile,
      phone,
      type_of_employment,
    };
    const validateData = Validator.validateAgent(data);
    if (!validateData) {
      return res.status(400).send("Invalid Request");
    }
    const agent = await prisma.agent.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
        address,
        phone,
        profile,
        type_of_employment,
      },
    });
    res.status(201).json(agent);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const DeleteAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send("Invalid Request");
    }

    const agent = await prisma.agent.delete({
      where: {
        id: id,
      },
    });
    if (!agent) {
      return res.status(404).send("Agent not found");
    }
    res.status(200).json(agent);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


export const UpdateAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, address, phone, type_of_employment, profile } = req.body;
    if (!name || !email || !password || !address || !phone || !type_of_employment) {
      return res.status(400).send("Invalid Request");
    }
    console.log(name)
    if (!id) {
      return res.status(400).send("Invalid Request")
    }
    const data = {
      name,
      email,
      password,
      address,
      profile,
      phone,
      type_of_employment,
    };
    const validateData = Validator.validateAgent(data);
    if (!validateData) {
      return res.status(400).send("Invalid Request");
    }
    const updateAgent = await prisma.agent.update({
      where: {
        id: id
      },
      data: {
        name,
        email,
        password,
        address,
        phone,
        profile,
        type_of_employment,
      },
    })
    res.status(200).json({ msg: "Updated Successfully", ...updateAgent })
  } catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error")
  }
}



export const ShowAgents = async (req: Request, res: Response) => {
  try {
    const agents = await prisma.agent.findMany();
    if (!agents) {
      return res.status(404).send("Agents not found");
    }
    // await redisClient.set('agents', JSON.stringify(agents))
    res.status(200).json(agents);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


export const VerifyClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send("Something went wrong")
    }
    const clients = await prisma.clients.findFirst({
      where: {
        qr_id: id
      }
    })
    if (!clients) {
      return res.status(404).send("Data not found")
    }
    res.status(200).json(clients)

  } catch (error) {
    res.status(500).send("Internal server error")
  }
}

export const VerifyQRID = async (req: Request, res: Response) => {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).send("ID is not provided")
    }
    const qrCode = await prisma.qRCodes.findFirst({
      where: {
        public_key: id
      }
    })
    if (!qrCode) {
      return res.status(400).send("QR Code not found")
    }
    res.status(200).json({ private_key: qrCode.private_key })
  } catch (error) {
    res.status(500).send("Internal Server Error")
  }
}