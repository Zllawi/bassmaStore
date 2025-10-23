import type { Express } from 'express'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env'

function initCloudinary() {
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

// S3-compatible uploader (AWS S3, R2, Wasabi, DO Spaces, MinIO)
export async function uploadToS3(files: Express.Multer.File[]): Promise<string[]> {
  if (!files || !files.length) return []
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const region = env.S3_REGION || 'auto'
  const bucket = env.S3_BUCKET!
  const endpoint = env.S3_ENDPOINT
  const forcePathStyle = env.S3_FORCE_PATH_STYLE === 'true'

  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY ? {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY
    } : undefined
  })

  const folder = env.CLOUDINARY_FOLDER || 'shop-uploads'
  const publicBase = env.S3_PUBLIC_URL_BASE

  return await Promise.all(files.map(async (file) => {
    const key = `${folder}/${Date.now()}-${file.originalname}`
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }))

    if (publicBase) return `${publicBase.replace(/\/$/, '')}/${key}`

    if (endpoint) {
      // For S3-compatible endpoints
      if (forcePathStyle) return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`
      const host = endpoint.replace(/^https?:\/\//, '').replace(/\/$/, '')
      return `https://${bucket}.${host}/${key}`
    }
    // AWS S3 default URL
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  }))
}
