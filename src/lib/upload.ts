'use server'

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Server-side signed upload to Cloudinary.
 * The file is sent from the browser via FormData; the API secret stays on the server.
 * Returns the optimized secure URL.
 */
export async function uploadImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'No file provided.' }
  }
  if (!file.type.startsWith('image/')) {
    return { error: 'Only image files are allowed.' }
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'crafterp',
      resource_type: 'image',
    })
    return { url: result.secure_url }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Upload failed.' }
  }
}
