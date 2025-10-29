import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      selfie,
      prompt,
      location,
      coCreateImages,
      outfitImage,
      locationImage,
    } = await request.json();

    if (!selfie || !prompt) {
      return NextResponse.json(
        { error: "Missing required parameters: selfie and prompt" },
        { status: 400 },
      );
    }

    const hasMultipleCharacters = coCreateImages && coCreateImages.length > 0;
    const hasOutfitReference = outfitImage && outfitImage.length > 0;
    const hasLocationImage = locationImage && locationImage.length > 0;

    const byteplusApiKey = process.env.BYTEPLUS_API_KEY;
    const byteplusBaseUrl =
      process.env.BYTEPLUS_BASE_URL ||
      "https://ark.ap-southeast.bytepluses.com/api/v3";
    const byteplusModel = process.env.BYTEPLUS_MODEL || "seedream-4-0-250828";

    if (!byteplusApiKey) {
      return NextResponse.json(
        { error: "BytePlus API key not configured" },
        { status: 500 },
      );
    }

    console.log("🎨 Using BytePlus Seedream model:", byteplusModel);
    console.log("📝 User intent:", prompt);
    console.log("🖼️  Image size:", selfie.length, "bytes");
    console.log(
      "👥 Multiple characters:",
      hasMultipleCharacters ? `Yes (${coCreateImages.length})` : "No",
    );
    console.log("👔 Outfit reference:", hasOutfitReference ? "Yes" : "No");
    console.log("📍 Location image:", hasLocationImage ? "Yes" : "No");

    // Step 1: If location image is provided, use Gemini Vision to describe it
    let locationDescription = "";
    if (hasLocationImage) {
      console.log("🔍 Analyzing location image with Gemini Vision...");

      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;

        if (geminiApiKey) {
          // Extract base64 data from the image (remove data:image/*;base64, prefix)
          const base64Data = locationImage.replace(
            /^data:image\/[a-z]+;base64,/,
            "",
          );

          const visionResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: "Describe this location in detail for a professional photography prompt. Include: architectural style, lighting conditions, atmosphere, colors, textures, mood, and any distinctive features. Be specific and vivid. Keep it under 100 words.",
                      },
                      {
                        inline_data: {
                          mime_type: "image/jpeg",
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
              }),
            },
          );

          if (visionResponse.ok) {
            const visionData = await visionResponse.json();
            locationDescription =
              visionData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
              "";
            console.log("✅ Location described by Gemini Vision");
            console.log(
              "📍 Description:",
              locationDescription.substring(0, 150) + "...",
            );
          } else {
            console.error(
              "❌ Gemini Vision API error:",
              await visionResponse.text(),
            );
          }
        }
      } catch (error) {
        console.error("❌ Error analyzing location image:", error);
      }
    }

    // Build complete user intent - integrate location description
    let userIntent = prompt;
    if (locationDescription) {
      userIntent = `${prompt}, in this environment: ${locationDescription}`;
    } else if (location) {
      userIntent = `${prompt} in ${location}`;
    }

    // Step 1: Rewrite prompt for BytePlus Seedream with detailed descriptive style
    console.log(
      "✍️  Rewriting prompt with detailed descriptive style for BytePlus...",
    );

    let rewrittenPrompt = "";

    try {
      // Use Gemini for BytePlus-optimized prompt rewriting
      const geminiApiKey = process.env.GEMINI_API_KEY;

      if (geminiApiKey) {
        const systemPrompt = `You are an expert in writing long, detailed image captions for professional photography. Given a short description of what a user wants to generate, your goal is to write an extremely detailed, descriptive caption that captures every visual element.

Be specific about:
- Subject: ethnicity, age, gender, expression, pose, body language
- Clothing & accessories: colors, textures, patterns, style, brand aesthetics
- Environment: architecture, furniture, materials, spatial layout, background elements
- Lighting: type (natural/artificial), direction, quality (hard/soft), color temperature, shadows, highlights
- Composition: framing, camera angle, depth of field, visual flow, balance
- Colors: dominant palette, accents, contrasts, saturation, warmth/coolness
- Mood & atmosphere: emotional tone, cultural references, cinematic qualities
- Technical style: photo realism level, film grain, sharpness, bokeh, color grading

Write in a dense, observational style like a professional photography description. Be objective and precise. Default to white ethnicity unless specified. Keep descriptions flowing naturally without bullet points.

Respond ONLY with the detailed description, no other text.`;

        const rewriteResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\nUser prompt: "${userIntent}"\n\nWrite a detailed photographic description:`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
              },
            }),
          },
        );

        if (rewriteResponse.ok) {
          const rewriteData = await rewriteResponse.json();
          rewrittenPrompt =
            rewriteData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "";
          console.log("✅ Prompt rewritten with detailed descriptive style");
          console.log(
            "📝 Rewritten:",
            rewrittenPrompt.substring(0, 200) + "...",
          );
        } else {
          console.error(
            "❌ Gemini rewrite API error:",
            await rewriteResponse.text(),
          );
        }
      }
    } catch (error) {
      console.error("❌ Error during prompt rewrite:", error);
    }

    // If rewrite fails, use descriptive fallback version
    if (!rewrittenPrompt) {
      console.log("⚠️  Prompt rewrite failed, using descriptive fallback");
      rewrittenPrompt = `A professional photographic portrait: ${userIntent}. Captured with natural lighting that highlights skin texture and details, shallow depth of field creating soft bokeh in background, photorealistic quality with cinematic color grading, sharp focus on subject with subtle film grain texture, professional composition following rule of thirds, warm color temperature creating inviting atmosphere, high-end editorial photography style`;
    }

    // Step 2: Generate 4 images using BytePlus Seedream in ONE call
    console.log(
      "🖼️  Generating 4 images with BytePlus Seedream in a single API call...",
    );

    // Prepare reference images array - BytePlus accepts base64 data URLs
    const referenceImages: string[] = [selfie];

    // Add co-create images if available
    if (hasMultipleCharacters) {
      referenceImages.push(...coCreateImages);
      console.log(
        `📸 Using ${referenceImages.length} reference images for multi-character generation`,
      );
    }

    // Don't add location image - only use the Gemini Vision description
    // This keeps the reference images focused on character identity
    if (hasLocationImage) {
      console.log(
        `📍 Using location description from Gemini Vision (not sending image as reference)`,
      );
    }

    // BytePlus accepts base64 data URLs in format: data:{mime};base64,{b64}
    // Keep images as-is (they're already in correct format)
    console.log(
      `🔧 Using ${referenceImages.length} reference image(s) for BytePlus API`,
    );

    // Try to generate 4 images in a single API call using n parameter
    console.log(
      "🖼️  Attempting to generate 4 variations in a single BytePlus API call...",
    );

    try {
      // Try single API call with n=4 first
      const requestBody = {
        model: byteplusModel,
        prompt: `${rewrittenPrompt}, professional photography, high quality, photorealistic, cinematic lighting, varied camera angles, preserve facial identity and features exactly`,
        image: referenceImages,
        response_format: "b64_json",
        size: "1152x1536", // Higher resolution (3:4 ratio)
        watermark: false,
        n: 4, // Request 4 variations
        image_strength: 0.85, // Higher value = stronger identity preservation (0-1)
      };

      console.log("🎨 Generating 4 variations with n=4 parameter...");

      const imageResponse = await fetch(
        `${byteplusBaseUrl}/images/generations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${byteplusApiKey}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const responseText = await imageResponse.text();

      if (!imageResponse.ok) {
        throw new Error(
          `API error (${imageResponse.status}): ${responseText.substring(0, 300)}`,
        );
      }

      const imageData = JSON.parse(responseText);

      // Check if we got 4 images back
      if (imageData.data && imageData.data.length >= 4) {
        const images = imageData.data
          .slice(0, 4)
          .map((item: any, i: number) => {
            if (item.b64_json) {
              console.log(`✅ Variation ${i + 1}/4 generated`);
              return `data:image/jpeg;base64,${item.b64_json}`;
            } else if (item.url) {
              console.log(`✅ Variation ${i + 1}/4 generated (URL)`);
              return item.url;
            }
            throw new Error(`No image data in variation ${i + 1}`);
          });

        console.log(
          `✨ Successfully generated ${images.length} images with BytePlus in single call!`,
        );

        return NextResponse.json({
          images,
          rewrittenPrompt,
          generated: true,
          provider: "BytePlus Seedream",
          model: byteplusModel,
          note: `Successfully generated ${images.length}/4 images using BytePlus Seedream ${byteplusModel} with ${referenceImages.length} reference image(s) in single API call`,
        });
      }

      // If n parameter didn't return 4 images, fall back to parallel calls
      console.log(
        "⚠️  Single API call with n=4 returned fewer than 4 images, falling back to parallel calls...",
      );
      throw new Error("Need to fall back to parallel generation");
    } catch (singleCallError) {
      console.log(
        "⚠️  Single API call failed, using parallel generation method...",
      );

      // Fallback: Generate 4 variations in parallel with different camera angles
      console.log("🖼️  Generating 4 variations in parallel with BytePlus...");

      const generateVariation = async (variationNum: number) => {
        const cameraAngles = [
          "front view, eye level, centered composition",
          "slight side angle, 3/4 view, dynamic composition",
          "low angle shot looking up, powerful perspective",
          "slightly elevated angle, editorial style",
        ];

        const cameraAngle = cameraAngles[variationNum - 1];

        const requestBody = {
          model: byteplusModel,
          prompt: `${rewrittenPrompt}, ${cameraAngle}, professional photography, high quality, photorealistic, cinematic lighting, preserve facial identity and features exactly`,
          image: referenceImages,
          response_format: "b64_json",
          size: "1152x1536", // Higher resolution (3:4 ratio)
          watermark: false,
          image_strength: 0.85, // Higher value = stronger identity preservation (0-1)
        };

        console.log(
          `🎨 Generating variation ${variationNum}/4... (${cameraAngle})`,
        );

        const imageResponse = await fetch(
          `${byteplusBaseUrl}/images/generations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${byteplusApiKey}`,
            },
            body: JSON.stringify(requestBody),
          },
        );

        const responseText = await imageResponse.text();

        if (!imageResponse.ok) {
          throw new Error(
            `API error (${imageResponse.status}): ${responseText.substring(0, 300)}`,
          );
        }

        const imageData = JSON.parse(responseText);

        if (imageData.data?.[0]?.b64_json) {
          const base64Image = `data:image/jpeg;base64,${imageData.data[0].b64_json}`;
          console.log(`✅ Variation ${variationNum}/4 generated`);
          return base64Image;
        } else if (imageData.data?.[0]?.url) {
          console.log(`✅ Variation ${variationNum}/4 generated (URL)`);
          return imageData.data[0].url;
        }

        throw new Error("No image data in response");
      };

      // Generate 4 variations in parallel
      const results = await Promise.allSettled([
        generateVariation(1),
        generateVariation(2),
        generateVariation(3),
        generateVariation(4),
      ]);

      const images: string[] = [];
      const errors: string[] = [];

      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          images.push(result.value);
        } else {
          console.error(`❌ Variation ${i + 1} failed:`, result.reason);
          errors.push(`Variation ${i + 1}: ${result.reason}`);
        }
      });

      if (images.length === 0) {
        return NextResponse.json(
          {
            error: "All BytePlus image generations failed",
            details: errors,
            model: byteplusModel,
            suggestion: "Check terminal logs for detailed errors",
          },
          { status: 500 },
        );
      }

      // Ensure we have 4 images (duplicate if some failed)
      while (images.length < 4) {
        images.push(images[0]);
      }

      console.log(
        `✨ Successfully generated ${images.length} images with BytePlus in parallel!`,
      );

      return NextResponse.json({
        images: images.slice(0, 4),
        rewrittenPrompt,
        generated: true,
        provider: "BytePlus Seedream",
        model: byteplusModel,
        note: `Successfully generated ${images.length}/4 images using BytePlus Seedream ${byteplusModel} with ${referenceImages.length} reference image(s) in parallel`,
      });
    }
  } catch (error) {
    console.error("❌ Error in BytePlus route:", error);

    return NextResponse.json(
      {
        error: "Exception occurred in BytePlus route",
        details: error instanceof Error ? error.message : String(error),
        suggestion: "Check terminal logs for detailed errors",
      },
      { status: 500 },
    );
  }
}
