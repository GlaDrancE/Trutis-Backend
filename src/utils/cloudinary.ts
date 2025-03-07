import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

export const CloudinaryUpload = async (filename: string) => {
    try {
        const imgPath = `./public/temp/${filename}`;
        const result = await cloudinary.uploader.upload(imgPath)
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath)
        }
        console.log(result)

        return result.url;
    } catch (error) {

        console.log(error)

    }
}