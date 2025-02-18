import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware to handle errors
prisma.$use(async (params: any, next: (params: any) => Promise<any>) => {
    try {
        const result = await next(params);
        return result;
    } catch (error) {
        console.error("Prisma error:", error);
        throw error; // Re-throw the error after logging it
    }
});

export default prisma;
