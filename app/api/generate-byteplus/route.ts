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

    // Prepare reference images array
    const referenceImages: string[] = [selfie]

    // Add co-create images if available
    if (hasMultipleCharacters) {
      referenceImages.push(...coCreateImages)
      console.log(`📸 Using ${referenceImages.length} reference images for multi-character generation`)
    }

    // Single API call to generate 4 variations
    const requestBody: any = {
      model: byteplusModel,
      prompt: `${rewrittenPrompt}, professional photography, high quality, photorealistic, cinematic lighting`,
      image: referenceImages, // Array of base64 data URLs
      n: 4, // Generate 4 variations
      response_format: 'b64_json', // Get base64 response
      size: '1440x2560', // Portrait size
      watermark: false,
    }

    console.log(`🔧 BytePlus API request:`, {
      model: requestBody.model,
      promptLength: requestBody.prompt.length,
      referenceImageCount: requestBody.image.length,
      numVariations: requestBody.n,
      size: requestBody.size,
    })

    try {
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
        console.error(`❌ BytePlus API error (${imageResponse.status}):`, responseText.substring(0, 500))
        console.log('📋 Full error:', responseText)

        return NextResponse.json({
          error: 'BytePlus image generation failed',
          details: `API error (${imageResponse.status}): ${responseText.substring(0, 300)}`,
          model: byteplusModel,
          suggestion: 'BytePlus API rejected the request. Check terminal logs for details.'
        }, { status: 500 })
      }

      const imageData = JSON.parse(responseText)

      console.log(`📦 BytePlus response:`, {
        hasData: !!imageData.data,
        dataLength: imageData.data?.length || 0,
      })

      // Check for image data in response
      const images: string[] = []

      if (imageData.data && Array.isArray(imageData.data)) {
        for (const item of imageData.data) {
          if (item.b64_json) {
            const base64Image = `data:image/jpeg;base64,${item.b64_json}`
            images.push(base64Image)
            console.log(`✅ Generated image ${images.length}/${requestBody.n}`)
          } else if (item.url) {
            images.push(item.url)
            console.log(`✅ Generated image ${images.length}/${requestBody.n} (URL format)`)
          }
        }
      }

      if (images.length === 0) {
        const errorMsg = `No image data found in BytePlus response`
        console.error(`❌ ${errorMsg}`)
        console.log('📋 Response data:', JSON.stringify(imageData).substring(0, 500))

        return NextResponse.json({
          error: 'BytePlus returned no images',
          details: errorMsg,
          model: byteplusModel,
          suggestion: 'BytePlus API call succeeded but returned no image data. Check terminal logs.'
        }, { status: 500 })
      }

      console.log(`✨ Successfully generated ${images.length} images with BytePlus!`)

      // Ensure we have 4 images (duplicate if needed)
      while (images.length < 4) {
        images.push(images[0])
      }

      return NextResponse.json({
        images: images.slice(0, 4),
        rewrittenPrompt,
        generated: true,
        provider: 'BytePlus Seedream',
        model: byteplusModel,
        note: `Successfully generated ${images.length} images using BytePlus Seedream ${byteplusModel} with ${referenceImages.length} reference image(s)`
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
