import { v2 as cloudinary } from "cloudinary"

export const uploadVoice = async (filePath: string) => {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "video", // required for audio
    folder: "chat_voice",
    format: "mp3",
  })
}
