/**
 * Script to convert all avatar images to base64 URLs and upload to Vercel Blob
 * Run with: npx tsx scripts/convert-avatars.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { put } from '@vercel/blob'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') })

interface Avatar {
  id: string
  name: string
  username: string
  image: string
  base64Url?: string
  httpUrl?: string
}

const AVATARS_DIR = path.join(process.cwd(), 'public', 'avatar photo')
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'avatars-converted.json')

// Avatar list from lib/avatars.ts
const AVATARS: Avatar[] = [
  {
    id: 'amy',
    name: 'Amy',
    username: '@Amy',
    image: '/avatar%20photo/Amy.jpg',
  },
  {
    id: 'anna',
    name: 'Anna',
    username: '@Anna',
    image: '/avatar%20photo/Anna.jpg',
  },
  {
    id: 'billie',
    name: 'Billie Eilish',
    username: '@BillieEilish',
    image: '/avatar%20photo/BillyEllish.webp',
  },
  {
    id: 'guy',
    name: 'Guy',
    username: '@Guy',
    image: '/avatar%20photo/Guy.jpg',
  },
  {
    id: 'jackson',
    name: 'Jackson',
    username: '@Jackson',
    image: '/avatar%20photo/Jackson.jpg',
  },
  {
    id: 'kay',
    name: 'Kay',
    username: '@Kay',
    image: '/avatar%20photo/Kay.jpg',
  },
  {
    id: 'kk',
    name: 'KK',
    username: '@KK',
    image: '/avatar%20photo/KK.jpg',
  },
  {
    id: 'kool',
    name: 'Kool',
    username: '@Kool',
    image: '/avatar%20photo/Kool.jpg',
  },
  {
    id: 'lily',
    name: 'Lily',
    username: '@Lily',
    image: '/avatar%20photo/Lily.jpg',
  },
  {
    id: 'zoey',
    name: 'Zoey',
    username: '@Zoey',
    image: '/avatar%20photo/Zoey.jpg',
  },
]

async function convertAvatar(avatar: Avatar): Promise<Avatar> {
  console.log(`Processing ${avatar.name}...`)

  // Get file path
  const fileName = decodeURIComponent(avatar.image.replace('/avatar%20photo/', ''))
  const filePath = path.join(AVATARS_DIR, fileName)

  // Read file
  const fileBuffer = fs.readFileSync(filePath)

  // Convert to base64
  const base64Data = fileBuffer.toString('base64')
  const mimeType = fileName.endsWith('.webp') ? 'image/webp' : 'image/jpeg'
  const base64Url = `data:${mimeType};base64,${base64Data}`

  console.log(`✅ Converted ${avatar.name} to base64 (${base64Data.length} chars)`)

  // Upload to Vercel Blob if token is available
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`avatars/${fileName}`, fileBuffer, {
        access: 'public',
        contentType: mimeType,
      })

      console.log(`✅ Uploaded ${avatar.name} to Vercel Blob: ${blob.url}`)

      return {
        ...avatar,
        base64Url,
        httpUrl: blob.url,
      }
    } catch (error) {
      console.error(`❌ Failed to upload ${avatar.name}:`, error)

      return {
        ...avatar,
        base64Url,
      }
    }
  } else {
    console.log(`⚠️  Skipping Vercel Blob upload (no BLOB_READ_WRITE_TOKEN)`)

    return {
      ...avatar,
      base64Url,
    }
  }
}

async function main() {
  console.log('🚀 Starting avatar conversion...\n')

  const convertedAvatars: Avatar[] = []

  for (const avatar of AVATARS) {
    const converted = await convertAvatar(avatar)
    convertedAvatars.push(converted)
    console.log('')
  }

  // Save to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(convertedAvatars, null, 2))

  console.log(`\n✨ Done! Converted ${convertedAvatars.length} avatars`)
  console.log(`📝 Output saved to: ${OUTPUT_FILE}`)

  // Print summary
  const withBase64 = convertedAvatars.filter(a => a.base64Url).length
  const withHttp = convertedAvatars.filter(a => a.httpUrl).length

  console.log(`\n📊 Summary:`)
  console.log(`   - Avatars with base64 URLs: ${withBase64}`)
  console.log(`   - Avatars with HTTP URLs: ${withHttp}`)
}

main().catch(console.error)
