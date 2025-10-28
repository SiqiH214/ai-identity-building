import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { selfie, prompt, location, coCreateImages, outfitImage, poseImage, locationImage } = await request.json()

    if (!selfie || !prompt) {
      return NextResponse.json(
        { error: 'Missing required parameters: selfie and prompt' },
        { status: 400 }
      )
    }

    const hasMultipleCharacters = coCreateImages && coCreateImages.length > 0
    const hasOutfitReference = outfitImage && outfitImage.length > 0
    const hasPoseReference = poseImage && poseImage.length > 0
    const hasLocationReference = locationImage && locationImage.length > 0

    const geminiApiKey = process.env.GEMINI_API_KEY
    const imageModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Build complete user intent - integrate location naturally
    const userIntent = location
      ? `${prompt} in ${location}`
      : prompt

    console.log('🎨 Using model:', imageModel)
    console.log('📝 User intent:', userIntent)
    console.log('🖼️  Image size:', selfie.length, 'bytes')
    console.log('👥 Multiple characters:', hasMultipleCharacters ? `Yes (${coCreateImages.length})` : 'No')
    console.log('👔 Outfit reference:', hasOutfitReference ? 'Yes' : 'No')
    console.log('🧘 Pose reference:', hasPoseReference ? 'Yes' : 'No')
    console.log('📍 Location reference:', hasLocationReference ? 'Yes' : 'No')

    // Step 0: If outfit is provided, describe it first
    let outfitDescription = ''
    if (hasOutfitReference) {
      console.log('👔 Describing outfit from reference image...')

      const outfitDescribeParts = [
        {
          inline_data: {
            mime_type: outfitImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
            data: outfitImage.split(',')[1],
          },
        },
        {
          text: `Describe this outfit in extreme detail for image generation purposes. Focus on:

1. **Clothing Items**: Identify each piece (shirt, pants, dress, jacket, etc.) with specific style names (e.g., "cropped hoodie", "high-waisted jeans", "bodycon dress")

2. **Colors & Patterns**: Describe exact colors, color combinations, and any patterns (stripes, florals, geometric, solid, etc.)

3. **Textile & Material**: Identify fabric types (cotton, denim, silk, leather, knit, etc.) and their qualities (soft, structured, flowing, rigid)

4. **Texture**: Describe visible texture (smooth, ribbed, quilted, distressed, brushed, glossy, matte, fuzzy, etc.)

5. **Fit & Silhouette**: Describe how the garment fits (oversized, fitted, relaxed, tailored, skin-tight, loose) and the overall silhouette

6. **Style & Aesthetic**: Name the fashion style (streetwear, athleisure, casual, sporty, chic, minimalist, etc.)

7. **Details & Accessories**: Mention any visible details like zippers, buttons, logos, pockets, jewelry, belts, bags, shoes

Provide a comprehensive 3-4 sentence description that captures all these elements for accurate image generation.`
        }
      ]

      const outfitDescribeResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: outfitDescribeParts
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 400,
            },
          }),
        }
      )

      if (outfitDescribeResponse.ok) {
        const outfitData = await outfitDescribeResponse.json()
        if (outfitData.candidates?.[0]?.content?.parts?.[0]?.text) {
          outfitDescription = outfitData.candidates[0].content.parts[0].text.trim()
          console.log('✅ Outfit described:', outfitDescription.substring(0, 100) + '...')
        }
      }
    }

    // Step 0.1: If pose is provided, describe it
    let poseDescription = ''
    if (hasPoseReference) {
      console.log('🧘 Describing pose from reference image...')

      const poseDescribeParts = [
        {
          inline_data: {
            mime_type: poseImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
            data: poseImage.split(',')[1],
          },
        },
        {
          text: `Describe this body pose and posture in extreme detail for image generation purposes. Focus on:

1. **Body Position**: Describe the overall stance (standing, sitting, leaning, lying down, etc.)
2. **Limb Placement**: Detail arm and leg positions (crossed, extended, bent, etc.)
3. **Hand Gestures**: Describe hand positioning and gestures precisely
4. **Head Angle**: Note the tilt and direction of the head
5. **Weight Distribution**: Describe how weight is distributed (leaning on one leg, centered, etc.)
6. **Body Angles**: Mention any twists, turns, or angles in the torso
7. **Overall Vibe**: The energy and feel of the pose (confident, relaxed, playful, contemplative, etc.)

Provide a comprehensive 2-3 sentence description that captures the exact pose for accurate reproduction.`
        }
      ]

      const poseDescribeResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: poseDescribeParts
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 300,
            },
          }),
        }
      )

      if (poseDescribeResponse.ok) {
        const poseData = await poseDescribeResponse.json()
        if (poseData.candidates?.[0]?.content?.parts?.[0]?.text) {
          poseDescription = poseData.candidates[0].content.parts[0].text.trim()
          console.log('✅ Pose described:', poseDescription.substring(0, 100) + '...')
        }
      }
    }

    // Step 0.2: If location is provided, describe it
    let locationDescription = ''
    if (hasLocationReference) {
      console.log('📍 Describing location from reference image...')

      const locationDescribeParts = [
        {
          inline_data: {
            mime_type: locationImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
            data: locationImage.split(',')[1],
          },
        },
        {
          text: `Describe this location/background in extreme detail for image generation purposes. Focus on:

1. **Location Type**: Identify the setting (indoor/outdoor, urban/nature, specific venue type)
2. **Architecture & Structures**: Describe buildings, walls, floors, ceilings, notable structures
3. **Lighting**: Natural or artificial lighting, time of day indicators, light quality
4. **Colors & Atmosphere**: Dominant colors, mood, weather conditions
5. **Key Elements**: Furniture, objects, decorations, natural features
6. **Spatial Layout**: Depth, perspective, foreground/background elements
7. **Style & Aesthetic**: Modern, vintage, minimalist, busy, natural, etc.

Provide a comprehensive 3-4 sentence description that captures the setting for accurate reproduction.`
        }
      ]

      const locationDescribeResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: locationDescribeParts
              }
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 400,
            },
          }),
        }
      )

      if (locationDescribeResponse.ok) {
        const locationData = await locationDescribeResponse.json()
        if (locationData.candidates?.[0]?.content?.parts?.[0]?.text) {
          locationDescription = locationData.candidates[0].content.parts[0].text.trim()
          console.log('✅ Location described:', locationDescription.substring(0, 100) + '...')
        }
      }
    }

    // Step 1: 使用专业摄影师的视角重写用户的提示词（保持身份）
    console.log('✍️  Rewriting prompt as professional photographer...')

    // Prepare outfit instruction if available
    const outfitInstruction = outfitDescription
      ? `\n\nOUTFIT REFERENCE: The subject should be wearing: ${outfitDescription}\nMake sure to incorporate this outfit description into the final image.`
      : ''

    // Prepare pose instruction if available
    const poseInstruction = poseDescription
      ? `\n\nPOSE REFERENCE: The subject should adopt this pose: ${poseDescription}\nMake sure to match this pose exactly in the final image.`
      : ''

    // Prepare location instruction if available
    const locationInstruction = locationDescription
      ? `\n\nLOCATION REFERENCE: The scene should be set in: ${locationDescription}\nMake sure to recreate this location/background accurately in the final image.`
      : ''

    // Build parts array with structured multi-image prompt
    const rewriteParts: any[] = []
    let rewrittenPrompt = ''

    try {

    if (hasMultipleCharacters) {
      // Multi-character: Following Google's official pattern
      // Order: TEXT (prompt) FIRST, then ALL images

      // 1. Add the text prompt first
      rewriteParts.push({
        text: `You are a world-class professional photographer. You will see ${coCreateImages.length + 1} reference images showing different people. Your task is to rewrite the user's intent into a professional photography prompt that includes ALL people from the reference images.

User's intent: "${userIntent}"${outfitInstruction}${poseInstruction}${locationInstruction}

Requirements:
- Include ALL ${coCreateImages.length + 1} people in the scene
- Preserve each person's exact facial features and identity
- Describe their interaction naturally
- Use professional photography language
- Be specific about lighting, composition, and mood

Rewrite this into ONE professional prompt:`
      })

      // 2. Then add ALL images (following Google's pattern)
      rewriteParts.push({
        inline_data: {
          mime_type: selfie.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          data: selfie.split(',')[1],
        },
      })

      coCreateImages.forEach((img: string, index: number) => {
        if (!img || typeof img !== 'string') {
          console.error(`❌ Co-create image ${index} is invalid:`, img)
          return
        }
        rewriteParts.push({
          inline_data: {
            mime_type: img.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
            data: img.split(',')[1],
          },
        })
      })
    } else {
      // Single character: original structure
      rewriteParts.push({
        inline_data: {
          mime_type: selfie.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          data: selfie.split(',')[1],
        },
      })

      rewriteParts.push({
        text: `You are a world-class professional Adobe photographer with exceptional taste in image generation and editing.

User's intent: "${userIntent}"${outfitInstruction}${poseInstruction}${locationInstruction}

Your task: Rewrite this into ONE professional image editing prompt that will be sent to Gemini's image generation API.

CRITICAL REQUIREMENTS:
1. PRESERVE the subject's facial identity, features, and essence EXACTLY as shown in the photo
2. Transform ONLY the scene, environment, lighting, clothing, pose, and atmosphere to match user's intent
3. Use professional photography language: lighting techniques, camera specs, composition, depth of field
4. Be specific about: time of day, weather, mood, color palette, styling
5. Keep it photorealistic - no cartoon, illustration, or stylization
6. Make it cinematic and high-quality

Return ONLY the rewritten prompt text, no JSON, no explanation, just the prompt itself.

Example format:
"Professional photograph of the person from this image, [scene description], [lighting details], [clothing if relevant], [camera and lens specs], [quality descriptors], photorealistic, 8k quality"

Now rewrite the user's intent into a single, detailed professional prompt:`
      })
    }

    const rewriteResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: rewriteParts
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    if (rewriteResponse.ok) {
      const rewriteData = await rewriteResponse.json()
      if (rewriteData.candidates?.[0]?.content?.parts?.[0]?.text) {
        rewrittenPrompt = rewriteData.candidates[0].content.parts[0].text.trim()
        console.log('✅ Prompt rewritten professionally')
        console.log('📝 Rewritten:', rewrittenPrompt.substring(0, 150) + '...')
      } else {
        console.error('⚠️ Rewrite response missing text:', JSON.stringify(rewriteData).substring(0, 500))
      }
    } else {
      const errorText = await rewriteResponse.text()
      console.error('❌ Rewrite API error:', errorText.substring(0, 500))
    }

    } catch (rewriteError) {
      console.error('❌ Error during prompt rewrite:', rewriteError)
      rewrittenPrompt = ''
    }

    // If rewrite fails, use simple version
    if (!rewrittenPrompt) {
      console.log('⚠️  Prompt rewrite failed, using simple version')
      rewrittenPrompt = `Professional photograph of the person from this image, ${userIntent}, natural lighting, photorealistic, high quality`
    }

    // Step 2: Generate 4 image variations in PARALLEL with different styles
    console.log('🖼️  Generating 4 image variations in parallel...')

    const errors: string[] = []

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

    // Create parallel fetch promises for all 4 images
    const generateImagePromise = async (variation: typeof styleVariations[0], index: number) => {
      try {
        console.log(`🎨 Generating ${variation.name} (${index + 1}/4)...`)

        // Build parts array with structured multi-image prompt
        const generateParts: any[] = []

        if (hasMultipleCharacters) {
          // Multi-character: Following Google's official pattern
          // Order: TEXT (prompt) FIRST, then ALL images

          // 1. Add the text prompt first
          generateParts.push({
            text: `Generate an image with ALL ${coCreateImages.length + 1} people shown in the reference images. Each person must maintain their exact facial identity.

${variation.prompt}

CRITICAL: Include ALL ${coCreateImages.length + 1} people in the image. Each person's face must match their reference image exactly.`
          })

          // 2. Then add ALL images (following Google's pattern)
          generateParts.push({
            inline_data: {
              mime_type: selfie.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
              data: selfie.split(',')[1],
            },
          })

          coCreateImages.forEach((img: string) => {
            generateParts.push({
              inline_data: {
                mime_type: img.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                data: img.split(',')[1],
              },
            })
          })
        } else {
          // Single character: original structure
          generateParts.push({
            inline_data: {
              mime_type: selfie.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
              data: selfie.split(',')[1],
            },
          })
          generateParts.push({
            text: variation.prompt
          })
        }

        const imageResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: generateParts
                }
              ],
              generationConfig: {
                temperature: 1.0,
                topP: 0.95,
                responseModalities: ["image"]
              }
            }),
          }
        )

        if (imageResponse.ok) {
          const imageData = await imageResponse.json()

          // Check for image data in response
          if (imageData.candidates?.[0]?.content?.parts) {
            for (const part of imageData.candidates[0].content.parts) {
              if (part.inlineData?.data) {
                const base64Image = `data:image/jpeg;base64,${part.inlineData.data}`
                console.log(`✅ ${variation.name} generated successfully`)
                return { success: true, image: base64Image, style: variation.name }
              }
            }
          }

          // No image found
          const errorMsg = imageData.candidates?.[0]?.content?.parts?.[0]?.text
            ? `API returned text instead of image: ${imageData.candidates[0].content.parts[0].text.substring(0, 100)}`
            : `No image data found in response`

          console.error(`❌ ${variation.name}: ${errorMsg}`)
          return { success: false, error: errorMsg, style: variation.name }
        } else {
          const errorText = await imageResponse.text()
          const errorMsg = `API error: ${errorText.substring(0, 200)}`
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
      console.error('❌ No images generated')
      console.log('💡 See API_GUIDE.md for alternative solutions (Replicate, Stability AI, etc.)')

      return NextResponse.json({
        error: 'Image generation failed',
        details: errors,
        model: imageModel,
        suggestion: 'Please check: 1) API Key is valid 2) Model supports image generation 3) Check terminal logs for detailed errors'
      }, { status: 500 })
    }

    console.log(`✨ Successfully generated ${images.length} images!`)

    // Ensure 4 images are returned (if less than 4, duplicate existing ones)
    while (images.length < 4) {
      images.push(images[0])
    }

    return NextResponse.json({
      images: images.slice(0, 4),
      rewrittenPrompt,
      generated: true,
      model: imageModel,
      note: `Successfully generated ${images.length} images using ${imageModel}`
    })

  } catch (error) {
    console.error('❌ Error in image generation:', error)

    return NextResponse.json({
      error: 'Exception occurred during image generation',
      details: error instanceof Error ? error.message : String(error),
      suggestion: 'Please check network connection, API Key configuration, or see terminal logs for detailed errors'
    }, { status: 500 })
  }
}


