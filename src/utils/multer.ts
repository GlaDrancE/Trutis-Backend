import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, String(file.originalname));
  },
});
const fileFilter = (req: any, file: any, callback: any) => {

  const supportedFiles = ['image/jpg', 'image/webp', 'image/png', 'image/jpeg']
  if (supportedFiles.includes(file.mimetype)) {
    return callback(null, true);
  } else {
    return callback("Unsupported File format", true)
  }

}
export const upload = multer({ storage: storage, fileFilter: fileFilter });
