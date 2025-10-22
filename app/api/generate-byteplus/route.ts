import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { selfie, prompt, location, coCreateImages, outfitImage } = await request.json()

    if (!selfie || !prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters: selfie and prompt' },
        { status: 400 }
      )
    }

    const hasMultipleCharacters = coCreateImages && coCreateImages.length > 0
    const hasOutfitReference = outfitImage && outfitImage.length > 0

    const byteplusApiKey = process.env.BYTEPLUS_API_KEY
    const byteplusBaseUrl = process.env.BYTEPLUS_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3'
    const byteplusModel = process.env.BYTEPLUS_MODEL || 'seedream-4-0-250828'

    if (!byteplusApiKey) {
      return NextResponse.json(
        { error: 'BytePlus API key not configured' },
        { status: 500 }
      )
    }

    // Build complete user intent - integrate location naturally
    const userIntent = location
      ? `${prompt} in ${location}`
      : prompt

    console.log('🎨 Using BytePlus Seedream model:', byteplusModel)
    console.log('📝 User intent:', userIntent)
    console.log('🖼️  Image size:', selfie.length, 'bytes')
    console.log('👥 Multiple characters:', hasMultipleCharacters ? `Yes (${coCreateImages.length})` : 'No')
    console.log('👔 Outfit reference:', hasOutfitReference ? 'Yes' : 'No')

    // Step 1: Rewrite prompt professionally
    console.log('✍️  Rewriting prompt as professional photographer...')

    let rewrittenPrompt = ''

    try {
      // Use OpenAI for prompt rewriting (BytePlus doesn't have text-only generation endpoint in the same way)
      const openaiApiKey = process.env.OPENAI_API_KEY

      if (openaiApiKey) {
        const rewriteResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a world-class professional photographer. Rewrite user prompts into detailed, professional photography descriptions.'
              },
              {
                role: 'user',
                content: `Rewrite this into a professional photography prompt: "${userIntent}"\n\nInclude details about lighting, composition, mood, and style. Make it photorealistic and cinematic.`
              }
            ],
            temperature: 0.8,
            max_tokens: 500,
          }),
        })

        if (rewriteResponse.ok) {
          const rewriteData = await rewriteResponse.json()
          rewrittenPrompt = rewriteData.choices?.[0]?.message?.content?.trim() || ''
          console.log('✅ Prompt rewritten professionally')
          console.log('📝 Rewritten:', rewrittenPrompt.substring(0, 150) + '...')
        }
      }
    } catch (error) {
      console.error('❌ Error during prompt rewrite:', error)
    }

    // If rewrite fails, use simple version
    if (!rewrittenPrompt) {
      console.log('⚠️  Prompt rewrite failed, using simple version')
      rewrittenPrompt = `Professional photograph of the person from this image, ${userIntent}, natural lighting, photorealistic, high quality`
    }

    // Step 2: Generate images using BytePlus Seedream
    console.log('🖼️  Generating images with BytePlus Seedream...')

    const errors: string[] = []

    // Prepare reference images array
    const referenceImages: string[] = [selfie]

    // Add co-create images if available
    if (hasMultipleCharacters) {
      referenceImages.push(...coCreateImages)
      console.log(`📸 Using ${referenceImages.length} reference images for generation`)
    }

    // Define 4 distinct style variations
    const styleVariations = [
      {
        name: 'Instagram Realistic',
        prompt: `${rewrittenPrompt}, shot on iPhone, Instagram aesthetic, natural lighting, candid moment, modern photography style, shallow depth of field, cinematic color grading, 8k quality, photorealistic`
      },
      {
        name: 'Surreal Pinterest',
        prompt: `${rewrittenPrompt}, surreal artistic edit, Pinterest aesthetic, dreamy atmosphere, soft pastel colors, ethereal lighting, artistic composition, creative digital art style, fantasy mood, painterly quality`
      },
      {
        name: 'Anime Style',
        prompt: `${rewrittenPrompt}, anime art style, Japanese animation aesthetic, vibrant colors, clean lines, Studio Ghibli inspired, beautiful anime character design, detailed anime illustration, high quality anime art`
      },
      {
        name: 'Unreal Engine',
        prompt: `${rewrittenPrompt}, Unreal Engine 5 render, hyperrealistic CGI, ray tracing, volumetric lighting, physically based rendering, ultra detailed 3D render, cinematic realism, next-gen graphics, photogrammetry quality`
      }
    ]

    // Generate images in parallel
    const generateImagePromise = async (variation: typeof styleVariations[0], index: number) => {
      try {
        console.log(`🎨 Generating ${variation.name} (${index + 1}/4) with BytePlus...`)

        // BytePlus API call following the Python SDK pattern
        const requestBody = {
          model: byteplusModel,
          prompt: variation.prompt,
          image: referenceImages, // Array of base64 data URLs
          response_format: 'b64_json', // Get base64 response
          size: '1440x2560', // Portrait size matching your example
          watermark: false,
        }

        console.log(`🔧 Request for ${variation.name}:`, {
          model: requestBody.model,
          promptLength: requestBody.prompt.length,
          imageCount: requestBody.image.length,
          size: requestBody.size,
        })

        const imageResponse = await fetch(`${byteplusBaseUrl}/images/generations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${byteplusApiKey}`,
          },
          body: JSON.stringify(requestBody),
        })

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()

          // Check for image data in response
          if (imageData.data?.[0]?.b64_json) {
            const base64Image = `data:image/jpeg;base64,${imageData.data[0].b64_json}`
            console.log(`✅ ${variation.name} generated successfully`)
            return { success: true, image: base64Image, style: variation.name }
          } else if (imageData.data?.[0]?.url) {
            // If URL format is returned
            const base64Image = imageData.data[0].url
            console.log(`✅ ${variation.name} generated successfully (URL format)`)
            return { success: true, image: base64Image, style: variation.name }
          }

          const errorMsg = `No image data found in response: ${JSON.stringify(imageData).substring(0, 200)}`
          console.error(`❌ ${variation.name}: ${errorMsg}`)
          return { success: false, error: errorMsg, style: variation.name }
        } else {
          const errorText = await imageResponse.text()
          const errorMsg = `API error (${imageResponse.status}): ${errorText.substring(0, 200)}`
          console.error(`❌ ${variation.name}: ${errorMsg}`)
          return { success: false, error: errorMsg, style: variation.name }
        }
      } catch (error) {
        const errorMsg = `Exception: ${error instanceof Error ? error.message : String(error)}`
        console.error(`❌ ${variation.name}: ${errorMsg}`)
        return { success: false, error: errorMsg, style: variation.name }
      }
    }

    // Generate all 4 images in parallel
    const results = await Promise.all(
      styleVariations.map((variation, index) => generateImagePromise(variation, index))
    )

    // Collect successful images and errors
    const images = results
      .filter(result => result.success)
      .map(result => result.image as string)

    results.forEach((result, index) => {
      if (!result.success) {
        errors.push(`${result.style}: ${result.error}`)
      }
    })

    // If no images were generated successfully, return error info
    if (images.length === 0) {
      console.error('❌ No images generated with BytePlus')

      return NextResponse.json({
        error: 'BytePlus image generation failed',
        details: errors,
        model: byteplusModel,
        suggestion: 'Please check: 1) API Key is valid 2) Model supports the requested parameters 3) Check terminal logs for detailed errors'
      }, { status: 500 })
    }

    console.log(`✨ Successfully generated ${images.length} images with BytePlus!`)

    // Ensure 4 images are returned (if less than 4, duplicate existing ones)
    while (images.length < 4) {
      images.push(images[0])
    }

    return NextResponse.json({
      images: images.slice(0, 4),
      rewrittenPrompt,
      generated: true,
      provider: 'BytePlus Seedream',
      model: byteplusModel,
      note: `Successfully generated ${images.length} images using BytePlus Seedream ${byteplusModel}`
    })

  } catch (error) {
    console.error('❌ Error in BytePlus image generation:', error)

    return NextResponse.json({
      error: 'Exception occurred during BytePlus image generation',
      details: error instanceof Error ? error.message : String(error),
      suggestion: 'Please check network connection, API Key configuration, or see terminal logs for detailed errors'
    }, { status: 500 })
  }
}
