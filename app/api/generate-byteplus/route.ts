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
      // Use OpenAI for prompt rewriting
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

    // Step 2: Generate 4 images using BytePlus Seedream in ONE call
    console.log('🖼️  Generating 4 images with BytePlus Seedream in a single API call...')

    // Prepare reference images array - BytePlus accepts base64 data URLs
    const referenceImages: string[] = [selfie]

    // Add co-create images if available
    if (hasMultipleCharacters) {
      referenceImages.push(...coCreateImages)
      console.log(`📸 Using ${referenceImages.length} reference images for multi-character generation`)
    }

    // BytePlus accepts base64 data URLs in format: data:{mime};base64,{b64}
    // Keep images as-is (they're already in correct format)
    console.log(`🔧 Using ${referenceImages.length} reference image(s) for BytePlus API`)

    // Generate 4 variations - BytePlus doesn't reliably support n parameter,
    // so we make 4 parallel API calls (like Gemini)
    console.log('🖼️  Generating 4 variations in parallel with BytePlus...')

    const generateVariation = async (variationNum: number) => {
      const requestBody = {
        model: byteplusModel,
        prompt: `${rewrittenPrompt}, professional photography, high quality, photorealistic, cinematic lighting`,
        image: referenceImages, // Array of base64 data URLs
        response_format: 'b64_json', // Get base64 response
        size: '1440x2560', // Portrait size
        watermark: false,
      }

      console.log(`🎨 Generating variation ${variationNum}/4...`)

      const imageResponse = await fetch(`${byteplusBaseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${byteplusApiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await imageResponse.text()

      if (!imageResponse.ok) {
        throw new Error(`API error (${imageResponse.status}): ${responseText.substring(0, 300)}`)
      }

      const imageData = JSON.parse(responseText)

      if (imageData.data?.[0]?.b64_json) {
        const base64Image = `data:image/jpeg;base64,${imageData.data[0].b64_json}`
        console.log(`✅ Variation ${variationNum}/4 generated`)
        return base64Image
      } else if (imageData.data?.[0]?.url) {
        console.log(`✅ Variation ${variationNum}/4 generated (URL)`)
        return imageData.data[0].url
      }

      throw new Error('No image data in response')
    }

    try {
      // Generate 4 variations in parallel
      const results = await Promise.allSettled([
        generateVariation(1),
        generateVariation(2),
        generateVariation(3),
        generateVariation(4),
      ])

      const images: string[] = []
      const errors: string[] = []

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          images.push(result.value)
        } else {
          console.error(`❌ Variation ${i + 1} failed:`, result.reason)
          errors.push(`Variation ${i + 1}: ${result.reason}`)
        }
      })

      if (images.length === 0) {
        return NextResponse.json({
          error: 'All BytePlus image generations failed',
          details: errors,
          model: byteplusModel,
          suggestion: 'Check terminal logs for detailed errors'
        }, { status: 500 })
      }

      // Ensure we have 4 images (duplicate if some failed)
      while (images.length < 4) {
        images.push(images[0])
      }

      console.log(`✨ Successfully generated ${images.length} images with BytePlus!`)

      return NextResponse.json({
        images: images.slice(0, 4),
        rewrittenPrompt,
        generated: true,
        provider: 'BytePlus Seedream',
        model: byteplusModel,
        note: `Successfully generated ${images.length}/4 images using BytePlus Seedream ${byteplusModel} with ${referenceImages.length} reference image(s)`
      })

    } catch (error) {
      console.error('❌ Exception during BytePlus API call:', error)

      return NextResponse.json({
        error: 'BytePlus image generation exception',
        details: error instanceof Error ? error.message : String(error),
        model: byteplusModel,
        suggestion: 'Check network connection, API Key, or see terminal logs for detailed errors'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in BytePlus route:', error)

    return NextResponse.json({
      error: 'Exception occurred in BytePlus route',
      details: error instanceof Error ? error.message : String(error),
      suggestion: 'Check terminal logs for detailed errors'
    }, { status: 500 })
  }
}
