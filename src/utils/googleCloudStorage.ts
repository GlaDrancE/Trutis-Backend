import { Storage } from '@google-cloud/storage'

const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    keyFilename: process.env.GCS_KEY_FILENAME
})

export const uploadFileToGCS = async (file: Express.Multer.File, filename: string) => {
    try {
        console.log("Uploading file to GCS")

        const gcs = storage.bucket(process.env.GCS_BUCKET_NAME as string)
        const storagePath = `reviews-images/sample-image`
        const result = await gcs.upload(file.path, {
            destination: storagePath,
            predefinedAcl: 'publicRead',
            metadata: {
                contentType: "application/plain"
            }
        })
        return result[0].metadata.mediaLink;
    } catch (error) {
        console.error(error)
    }
}