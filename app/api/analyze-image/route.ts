import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json(
        { error: 'Missing required parameter: image' },
        { status: 400 }
      )
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'

    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    console.log('🔍 Analyzing image with Gemini...')

    // Analyze the image with Gemini
    const analyzeResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                    data: image.split(',')[1],
                  },
                },
                {
                  text: `Analyze this image and extract the following information in JSON format:

{
  "location": {
    "name": "Specific location name or description (e.g., 'Cozy Cafe Interior', 'Urban Street Corner', 'Beach Sunset')",
    "description": "Detailed description of the location and environment",
    "setting": "Indoor/Outdoor/Studio",
    "atmosphere": "Describe the mood and atmosphere"
  },
  "outfit": {
    "name": "Brief outfit name (e.g., 'Casual Denim Look', 'Formal Business Attire')",
    "description": "Extremely detailed description of all clothing items, colors, patterns, textures, fit, and style. Include every visible detail about the outfit.",
    "style": "Fashion style category (e.g., streetwear, casual, formal, athletic)",
    "colors": ["Primary color 1", "Primary color 2"]
  },
  "pose": {
    "name": "Pose name (e.g., 'Standing Confident', 'Sitting Relaxed', 'Walking Forward')",
    "description": "Detailed description of body position, posture, hand placement, facial expression",
    "mood": "The emotion/mood conveyed by the pose"
  }
}

Be specific and detailed, especially for the outfit description. Include fabric types, patterns, fit, and any accessories visible.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        }),
      }
    )

    if (analyzeResponse.ok) {
      const analyzeData = await analyzeResponse.json()
      const responseText = analyzeData.candidates?.[0]?.content?.parts?.[0]?.text

      if (responseText) {
        console.log('✅ Image analyzed successfully')
        console.log('📝 Response:', responseText.substring(0, 200) + '...')

        // Extract JSON from the response
        let extractedData
        try {
          // Try to parse as pure JSON first
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0])
          } else {
            throw new Error('No JSON found in response')
          }
        } catch (parseError) {
          console.error('❌ Failed to parse JSON:', parseError)
          // Return a structured error with the raw text
          return NextResponse.json({
            error: 'Failed to parse analysis result',
            rawText: responseText,
            suggestion: 'The AI response was not in the expected JSON format'
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          data: extractedData,
          image: image
        })
      } else {
        console.error('⚠️ Analysis response missing text')
        return NextResponse.json({
          error: 'No analysis text in response',
          details: JSON.stringify(analyzeData).substring(0, 500)
        }, { status: 500 })
      }
    } else {
      const errorText = await analyzeResponse.text()
      console.error('❌ Analysis API error:', errorText.substring(0, 500))
      return NextResponse.json({
        error: 'Image analysis failed',
        details: errorText.substring(0, 200)
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Error in image analysis:', error)

    return NextResponse.json({
      error: 'Exception occurred during image analysis',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
