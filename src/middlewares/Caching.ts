import { NextFunction, Request, Response } from 'express'
import redisClient from '../utils/caching';

export const CacheClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        next();
        // const cacheKey = "clients";
        // const cacheClients = await redisClient.get(cacheKey)
        // if (cacheClients) {
        //     return res.status(200).json(JSON.parse(cacheClients))
        // }
        // console.log('Failed to load cached data, loading from database...')


    } catch (error) {
        console.error("Something went wrong while caching: ", error)
    }
}
export const CacheClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        next();
        // const cacheClient = await redisClient.get(id)
        // if (cacheClient) {
        //     return res.status(200).json(JSON.parse(cacheClient))
        // }
        // console.log('Failed to load cached data, loading from database...')
    } catch (error) {
        console.error("Something went wrong while caching: ", error)
    }
}
export const CacheAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // const cacheKey = "agents";
        // const cacheClients = await redisClient.get(cacheKey)
        // if (cacheClients) {
        //     return res.status(200).json(JSON.parse(cacheClients))
        // }
        // console.log('Failed to load cached data, loading from database...')


        next();
    } catch (error) {
        console.error("Something went wrong while caching: ", error)
    }
}
export const CacheQr = async (req: Request, res: Response, next: NextFunction) => {
    try {

        // const cacheKey = "qrCodes";
        // const cacheClients = await redisClient.get(cacheKey)
        // if (cacheClients) {
        //     return res.status(200).json(JSON.parse(cacheClients))
        // }
        // console.log('Failed to load cached data, loading from database...')


        next();
    } catch (error) {
        console.error("Something went wrong while caching: ", error)
    }
}