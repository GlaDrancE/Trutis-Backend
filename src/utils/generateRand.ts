export const generateRandom = (length: number) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let randomString = ""
    const randomArray = new Uint8Array(length);
    crypto.getRandomValues(randomArray)

    randomArray.forEach(random => {
        randomString += chars[random % chars.length]
    })
    return randomString;
}
