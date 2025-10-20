import type { Express } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env'

function initCloudinary() {
  // If CLOUDINARY_URL is set, SDK reads it automatically. Otherwise, use individual keys.
  if (process.env.CLOUDINARY_URL) return
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET
    })
  }
}

export async function uploadToCloud(files: Express.Multer.File[]): Promise<string[]> {
  if (!files || !files.length) return []
  initCloudinary()
  const folder = env.CLOUDINARY_FOLDER || 'shop-uploads'

  return await Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
              if (error || !result?.secure_url) return reject(error || new Error('Upload failed'))
              resolve(result.secure_url)
            }
          )
          stream.end(file.buffer)
        })
    )
  )
}

