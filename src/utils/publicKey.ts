import { generateRandom } from "./generateRand";
const publicKeyStore = new Map<string, { publicKey: string, expiryTime: Date }>();
export const generatePublicKey = () => {
    // const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const publicKey = generateRandom(8);
    // publicKeyStore.set(clientId, { publicKey, expiryTime });
    return publicKey;
}

export const verifyPublicKey = (clientId: string, publicKey: string) => {
    const publicKeyData = publicKeyStore.get(clientId);
    if (!publicKeyData) {
        return false;
    }
    if (publicKeyData.expiryTime < new Date()) {
        publicKeyStore.delete(clientId);
        return false;
    }
    if (publicKeyData.publicKey !== publicKey) {
        return false;
    }
    publicKeyStore.delete(clientId);
    return true;
}