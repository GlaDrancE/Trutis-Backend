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

    res.json({ token, agentId: agent.id });
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
        id: id
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

export const linkQRCode = async (req: Request, res: Response) => {
  try {
    const { publicKey, QRId, agentId } = req.body;

    if (!publicKey || !QRId) {
      return res.status(400).json({ error: "Client ID and QR ID are required." });
    }

    const qrCode = await prisma.qRCodes.findUnique({
      where: { private_key: QRId }
    });

    if (!qrCode) {
      return res.status(404).json({ error: "Invalid QR Code." });
    }

    const updatedClient = await prisma.clients.update({
      where: { public_key: publicKey },
      data: { qr_id: QRId }
    });

    const updatedQRCode = await prisma.qRCodes.update({
      where: { private_key: QRId },
      data: { client_id: updatedClient?.id }
    });

    const newAgentClient = await prisma.agentClients.create({
      data: {
        agent_id: agentId,
        client_id: updatedClient?.id,
      },
    });

    res.status(200).json({
      message: "QR Code linked successfully.",
      client: updatedClient,
      qrCode: updatedQRCode,
      agentClient: newAgentClient
    });

  } catch (error) {
    console.error("Error linking QR Code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getAgentClients = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ error: "Agent ID is required" });
    }


    const agentClients = await prisma.agentClients.findMany({
      where: { agent_id: agentId },
      include: { client: true },
    });

    res.status(200).json(agentClients);
  } catch (error) {
    console.error("Error fetching agent clients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getAgentProfile = async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        AgentClients: true,
        isActive: true
      },
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }


    const totalVerifications = agent.AgentClients.length;

    res.status(200).json({ ...agent, totalVerifications });
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateAgentStatus = async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { newStatus: isActive } = req.body;

  try {
    const updatedAgent = await prisma.agent.update({
      where: { id: agentId },
      data: { isActive }
    });

    res.status(200).json({ updatedAgent });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};
