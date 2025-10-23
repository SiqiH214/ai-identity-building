/**
 * Upload utility functions for handling image uploads
 */

import { put } from '@vercel/blob'

/**
 * Upload a base64 image to Vercel Blob Storage
 * Returns the public URL of the uploaded image
 */
export async function uploadBase64Image(
  base64Image: string,
  filename: string = `image-${Date.now()}.jpg`
): Promise<string> {
  try {
    // Extract base64 data from data URL
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    })

    console.log(`✅ Uploaded image to Vercel Blob: ${blob.url}`)
    return blob.url
  } catch (error) {
    console.error('❌ Failed to upload image to Vercel Blob:', error)
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Upload multiple base64 images to Vercel Blob Storage
 * Returns array of public URLs
 */
export async function uploadBase64Images(base64Images: string[]): Promise<string[]> {
  const uploadPromises = base64Images.map((img, i) =>
    uploadBase64Image(img, `ref-image-${Date.now()}-${i}.jpg`)
  )

  return await Promise.all(uploadPromises)
}
