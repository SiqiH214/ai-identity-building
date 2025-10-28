/**
 * API client functions
 */

export interface GenerateImageParams {
  selfie: string
  prompt: string
  location?: string
  coCreateImages?: string[] // Additional character images for multi-character generation
  outfitImage?: string // Outfit reference image
  poseImage?: string // Pose reference image
  locationImage?: string // Location reference image
}

export interface GenerateImageResponse {
  images?: string[]
  error?: string
  details?: string[] | string
  model?: string
  suggestion?: string
  note?: string
  rewrittenPrompt?: string
  generated?: boolean
}

/**
 * Call image generation API (Gemini)
 */
export async function generateImages(
  params: GenerateImageParams
): Promise<GenerateImageResponse> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      // Create an Error object containing all error information
      const error: any = new Error(data.error || 'Generation failed')
      error.details = data.details
      error.suggestion = data.suggestion
      error.model = data.model
      throw error
    }

    return data
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

/**
 * Call BytePlus Seedream image generation API
 */
export async function generateImagesByteplus(
  params: GenerateImageParams
): Promise<GenerateImageResponse> {
  try {
    const response = await fetch('/api/generate-byteplus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()

    if (!response.ok) {
      // Create an Error object containing all error information
      const error: any = new Error(data.error || 'BytePlus generation failed')
      error.details = data.details
      error.suggestion = data.suggestion
      error.model = data.model
      throw error
    }

    return data
  } catch (error) {
    console.error('BytePlus API call failed:', error)
    throw error
  }
}

/**
 * Download image
 */
export function downloadImage(imageUrl: string, filename: string = 'image.jpg') {
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Convert File to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

