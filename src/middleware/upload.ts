import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../config/cloudinary.js"

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat_voice" as any,
    resource_type: "video",
    format: "mp3",
  } as any,
})

export const upload = multer({ storage })
