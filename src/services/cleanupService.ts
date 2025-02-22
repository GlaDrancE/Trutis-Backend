// import prisma from "../db/prisma";

// export const cleanupPublicKey = async () => {
//     const oneDayAgo = new Date(Date.now() - 60 * 1000);
//     await prisma.clients.updateMany({
//         where: {
//             createdAt: {
//                 lt: oneDayAgo
//             }
//         },
//         data: {
//             public_key: null
//         }
//     })
// } 