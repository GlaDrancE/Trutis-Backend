import { createClient } from 'redis'

const redisClient = createClient();
redisClient.connect()
    .then(() => console.log("Successfully established the connection with redis"))
    .catch(err => { console.error("Something went wrong", err) });


// redisClient.connect()
//     .then(() => console.log("Successfully established connection with redis"))
//     .catch(err => console.error("Something went wrong with redis: ", err))
// redisClient.on("error", (err) => {
//     console.error("Error while creating redis client: ", err);
// })


export default redisClient;